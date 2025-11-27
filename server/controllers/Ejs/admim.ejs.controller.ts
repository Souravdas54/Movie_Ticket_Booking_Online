import { Request, Response } from 'express';
import { bookingModel } from '../../models/booking.model';
import { movieModel } from '../../models/movie.model';
import { userModel } from '../../models/user.Model';

class AdminController {
    async admin_dashboard(req: Request, res: Response): Promise<void> {
        try {
            // ✅ Get total movies count using aggregation
            const moviesCount = await movieModel.aggregate([
                {
                    $count: "totalMovies"
                }
            ]);

            // ✅ Get total bookings count using aggregation
            const bookingsCount = await bookingModel.aggregate([
                {
                    $count: "totalBookings"
                }
            ]);

            // ✅ Calculate total revenue using aggregation pipeline
            const revenueData = await bookingModel.aggregate([
                {
                    $match: {
                        status: "Confirmed",
                        paymentStatus: "Paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalAmount" },
                        totalBookings: { $sum: 1 }
                    }
                }
            ]);

            // ✅ Get recent bookings with aggregation (without populate)
            const recentBookings = await bookingModel.aggregate([
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $limit: 5
                },
                {
                    $lookup: {
                        from: "movies",
                        localField: "movieId",
                        foreignField: "_id",
                        as: "movieData"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $lookup: {
                        from: "theaters",
                        localField: "theaterId",
                        foreignField: "_id",
                        as: "theaterData"
                    }
                },
                {
                    $lookup: {
                        from: "shows",
                        localField: "showId",
                        foreignField: "_id",
                        as: "showData"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        bookingId: { $toString: "$_id" },
                        movieName: {
                            $arrayElemAt: ["$movieData.moviename", 0]
                        },
                        userEmail: {
                            $arrayElemAt: ["$userData.email", 0]
                        },
                        userName: {
                            $arrayElemAt: ["$userData.name", 0]
                        },
                        theaterName: {
                            $arrayElemAt: ["$theaterData.theatername", 0]
                        },
                        showTime: {
                            $arrayElemAt: ["$showData.showTime", 0]
                        },
                        showDate: {
                            $arrayElemAt: ["$showData.date", 0]
                        },
                        seats: 1,
                        totalAmount: 1,
                        status: 1,
                        paymentStatus: 1,
                        bookedAt: 1,
                        createdAt: 1
                    }
                }
            ]);

            // ✅ Get today's bookings count
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayBookings = await bookingModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: today }
                    }
                },
                {
                    $count: "count"
                }
            ]);

            // ✅ Get popular movies (most booked)
            const popularMovies = await bookingModel.aggregate([
                {
                    $group: {
                        _id: "$movieId",
                        bookingCount: { $sum: 1 },
                        totalRevenue: { $sum: "$totalAmount" }
                    }
                },
                {
                    $sort: { bookingCount: -1 }
                },
                {
                    $limit: 5
                },
                {
                    $lookup: {
                        from: "movies",
                        localField: "_id",
                        foreignField: "_id",
                        as: "movieInfo"
                    }
                },
                {
                    $project: {
                        movieName: { $arrayElemAt: ["$movieInfo.moviename", 0] },
                        bookingCount: 1,
                        totalRevenue: 1
                    }
                }
            ]);

            // ✅ Use actual user data from request
            const user = await userModel.findById(req.user?.userId).select('name email');

            const dashboardData = {
                title: 'Admin Dashboard - BookMyCinema',
                user: {
                    name: user?.name,
                    email: user?.email,
                    avatar: user?.name.charAt(0).toUpperCase(),
                    profilePicture: user?.profilePicture || null,
                    role: req.user?.role || 'N/A'
                },
                stats: {
                    totalMovies: moviesCount[0]?.totalMovies || 0,
                    totalBookings: bookingsCount[0]?.totalBookings || 0,
                    totalRevenue: `₹${(revenueData[0]?.totalRevenue || 0).toLocaleString()}`,
                    todayBookings: todayBookings[0]?.count || 0,
                    pendingReviews: 12 // আপনি এটি পরে implement করতে পারেন
                },
                recentBookings: recentBookings.map(booking => ({
                    id: `#BKM${booking.bookingId.slice(-4).toUpperCase()}`,
                    movie: booking.movieName || 'N/A',
                    user: booking.userEmail || 'N/A',
                    userName: booking.userName || 'N/A',
                    theater: booking.theaterName || 'N/A',
                    showTime: booking.showTime || 'N/A',
                    showDate: booking.showDate ? new Date(booking.showDate).toLocaleDateString() : 'N/A',
                    bookedAt: booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : 'N/A',
                    seats: Array.isArray(booking.seats) ? booking.seats.join(', ') : 'N/A',
                    amount: `₹${booking.totalAmount}`,
                    status: booking.status,
                    paymentStatus: booking.paymentStatus
                })),
                popularMovies: popularMovies.map(movie => ({
                    name: movie.movieName || 'N/A',
                    bookings: movie.bookingCount,
                    revenue: `₹${movie.totalRevenue}`
                }))
            };

            res.render('dashboard', dashboardData
                //  {
                //     title: 'Admin Dashboard',
                //     // user: req.user // যদি authentication থাকে
                // }
            );
        } catch (error) {
            console.error('Dashboard render error:', error);
            res.status(500).render('error', {
                message: 'Dashboard load করতে সমস্যা হয়েছে'
            });
        }
    }

    async login(req: Request, res: Response) {
        res.render('login', {
            title: "Admin Login"
        })
    }
}

export const adminController = new AdminController()
