import { Request, Response } from 'express';
import { userRepositories } from '../repository/user.repo';
import { UserValidation } from '../validation/user.validation';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { roleModel } from '../models/role.model';
import { TokenService } from '../services/token.service';
import { emailService } from '../services/email.service';
import { sendOtpEmail } from '../services/send.otpmail.service';
import cloudinary from '../config/cloudinaryConfig';


class UserController {
    async register(req: Request, res: Response): Promise<any> {
        try {
            console.log("🚀 Register endpoint hit");
            console.log("📥 Request body:", req.body);
            console.log("📁 File:", req.file);

            // Validate input
            const { error, value } = UserValidation.signup.validate(req.body);
            if (error) {
                console.log("❌ Validation error:", error.message);
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            // console.log("✅ Validated data:", value);

            // Check if user already exists
            const existingUser = await userRepositories.findByEmail(value.email);
            if (existingUser) {
                console.log("Email already exists:", value.email);


                if (req.file && (req.file as any).filename) {
                    const publicId = (req.file as any).filename; //this is Cloudinary public_id

                    try {
                        await cloudinary.uploader.destroy(publicId);
                        console.log("🧹 Image deleted from Cloudinary:", publicId);
                    } catch (err) {
                        console.log("⚠️ Failed to delete image from Cloudinary:", err);
                    }
                }

                return res.status(400).json({
                    success: false,
                    message: "Email already registered"
                });
            }

            let profilePictureUrl = "";
            if (req.file) {
                // Cloudinary returns the file object with secure_url
                profilePictureUrl = (req.file as any).secure_url || (req.file as any).path;
                console.log("Profile picture uploaded successfully:", profilePictureUrl);
                console.log("Full file object:", req.file);
            } else {
                console.log("No file received. Check multer configuration.");
                console.log("Request headers:", req.headers['content-type']);
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(value.password, salt);
            console.log("🔐 Password hashed successfully");

            // Set default role if not provided
            if (!value.role) {
                value.role = 'user';
                console.log("Default role assigned: user");
            }

            // Create user data object
            const userData = {
                name: value.name,
                email: value.email,
                phone: value.phone,
                gender: value.gender,
                password: hashedPassword,
                profilePicture: profilePictureUrl,
                isVerified: false,
                role: value.role
            };

            // console.log("💾 Saving user data:", userData);

            // Save user to database
            const newUser = await userRepositories.save(userData);

            if (!newUser) {
                console.log("Failed to create user in database");
                return res.status(500).json({
                    success: false,
                    message: "Failed to create user"
                });
            }

            console.log("User created successfully with ID:", newUser._id);

            // Generate verification token
            // const verificationToken = jwt.sign(
            //     {
            //         userId: newUser._id,
            //         email: newUser.email
            //     },
            //     process.env.JWT_SECRET as string,
            //     { expiresIn: '1d' }
            // );

             // Send OTP email for verification
            try {
              
                const otpSent = await sendOtpEmail(newUser.email, newUser);

                if (!otpSent) {
                    console.log('⚠️ Account created but OTP email sending failed');
                } else {
                    console.log('✅ OTP email sent successfully');
                }
            } catch (emailError) {
                console.log('⚠️ OTP email service error:', emailError);
            }

            // Send verification email
            try {
                const emailResult = await emailService.sendWelcomeEmail(
                    newUser.email,
                    newUser.name,
                );

                if (!emailResult.success) {
                    console.log('⚠️ Account created but email sending failed:', emailResult.error);
                } else {
                    console.log('✅ Wellcome email sent successfully');
                }
            } catch (emailError) {
                console.log('⚠️ Email service error:', emailError);
            }

            // Prepare response data (exclude password)
            const userResponse = {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                gender: newUser.gender,
                profilePicture: newUser.profilePicture,
                isVerified: newUser.isVerified,
                role: newUser.role,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            };

            return res.status(201).json({
                success: true,
                message: "Registration successful. Please verify your email.",
                data: userResponse
            });

        } catch (error: any) {
            console.log("Registration error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // async verifyEmail(req: Request, res: Response): Promise<any> {
    //     try {
    //         const { token } = req.params;
    //         const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    //         const user = await userRepositories.findByEmail(decoded.email);

    //         if (!user) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: "User not found"
    //             });
    //         }

    //         user.isVerified = true;
    //         await user.save();

    //         return res.status(200).json({
    //             success: true,
    //             message: "Email verified successfully!"
    //         });

    //     } catch (error: any) {
    //         console.log("Email verification error:", error.message);
    //         return res.status(400).json({
    //             success: false,
    //             message: "Invalid or expired token"
    //         });
    //     }
    // }

    async login(req: Request, res: Response): Promise<any> {
        try {
            const data = {
                email: req.body.email,
                password: req.body.password,
            };

            const { error, value } = UserValidation.login.validate(data);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            const userData = await userRepositories.findByEmail(value.email);
            if (!userData) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const isPasswordMatch = await bcrypt.compare(value.password, userData.password);
            if (!isPasswordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid password"
                });
            }

            // Get role name
            let roleName: string;
            if (typeof userData.role === 'string') {
                roleName = userData.role;
            } else {
                const roleDoc = await roleModel.findById(userData.role);
                if (!roleDoc) {
                    return res.status(500).json({
                        success: false,
                        message: "Role not found"
                    });
                }
                roleName = roleDoc.name;
            }

            // const payload = {
            //     name: userData.name,
            //     userId: userData._id.toString(),
            //     email: userData.email,
            //     phone: userData.phone,
            //     role: roleName,
            // };

            // Generate tokens
            const accessToken = TokenService.generateAccessToken(userData, roleName);
            const refreshToken = TokenService.generateRefreshToken(userData, roleName);

            await userRepositories.updateRefreshToken(userData._id.toString(), refreshToken);

            // Send welcome email
            // try {
            //     await emailService.sendWelcomeEmail(userData.email, userData.name);
            //     console.log('✅ Welcome email sent successfully');
            // } catch (emailError) {
            //     console.log('⚠️ Login successful but welcome email failed:', emailError);
            // }

            // Prepare user response without password
            const userResponse = {
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                profilePicture: userData.profilePicture,
                isVerified: userData.isVerified,
                role: roleName,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt
            };

            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: userResponse,
                tokens: {
                    accessToken,
                    refreshToken,
                    accessTokenExpires: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
                    refreshTokenExpires: process.env.JWT_REFRESH_EXPIRES_IN || '1d'
                }
            });

        } catch (error: any) {
            console.log("Login error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    // ... rest of your methods remain the same
    async refreshToken(req: Request, res: Response): Promise<any> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token is required"
                });
            }

            const user = await userRepositories.findByRefreshToken(refreshToken);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid refresh token"
                });
            }

            const decoded = TokenService.verifyRefreshToken(refreshToken) as any;

            let roleName: string;
            if (typeof user.role === 'string') {
                roleName = user.role;
            } else {
                const roleDoc = await roleModel.findById(user.role);
                roleName = roleDoc?.name || 'user';
            }

            const newAccessToken = TokenService.generateAccessToken(user, roleName);
            const newRefreshToken = TokenService.generateRefreshToken(user, roleName);

            await userRepositories.updateRefreshToken(user._id.toString(), newRefreshToken);

            return res.status(200).json({
                success: true,
                message: "Tokens refreshed successfully",
                data: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    accessTokenExpires: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
                    refreshTokenExpires: process.env.JWT_REFRESH_EXPIRES_IN || '1d'
                }
            });

        } catch (error: any) {
            console.log("Refresh Token Error:", error.message);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }
    }

    async getUserprofile(req: Request, res: Response): Promise<any> {
        try {
            const users = await userRepositories.find();

            if (users && users.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: "Data retrieved successfully",
                    data: users,
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "No users found",
                    data: []
                });
            }
        } catch (error: any) {
            console.log("Get users error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async getUserById(req: any, res: Response): Promise<any> {
        try {
            const { id } = req.params;
            const user = await userRepositories.getUserById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "User fetched successfully",
                data: user,
            });
        } catch (error: any) {
            console.log("Get user by ID error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async updateProfile(req: any, res: Response): Promise<any> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated"
                });
            }

            const updateData: any = {};
            if (req.body.name) updateData.name = req.body.name;
            if (req.body.phone) updateData.phone = req.body.phone;

            let newProfilePicture: string | undefined;
            if (req.file) {
                newProfilePicture = req.file.path;
            }

            const updatedUser = await userRepositories.update_user(
                userId,
                updateData,
                newProfilePicture
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const userResponse = {
                _id: updatedUser._id,
                name: updatedUser.name,
                phone: updatedUser.phone,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture,
                isVerified: updatedUser.isVerified,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            };

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: userResponse
            });

        } catch (error: any) {
            console.error('Update profile error:', error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }

    async logout(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.user?.userId;

            if (userId) {
                await userRepositories.updateRefreshToken(userId, null);
            }

            return res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });

        } catch (error: any) {
            console.log("Logout Error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }
}

export const userController = new UserController();