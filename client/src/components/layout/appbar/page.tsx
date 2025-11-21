"use client";

import React, { useState, useEffect } from "react";
import {
    AppBar, Toolbar, Typography, IconButton, Box, Button, Avatar, Menu, MenuItem, Divider, TextField,
    InputAdornment, Select, FormControl, InputLabel, useMediaQuery, useTheme, Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";

import LoginModal from "@/app/auth/signin/page";
import SignupModal from "@/app/auth/signup/page";
import Sidebar from "../sidebar/page";
import { UserType } from "@/types/usertype";

import './navbarstyle.css'


export default function Navbar() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [locationAnchorEl, setLocationAnchorEl] = useState<null | HTMLElement>(null);
    const [openSearchDrawer, setOpenSearchDrawer] = useState(false);
    const openMenu = Boolean(anchorEl);
    const openLocationMenu = Boolean(locationAnchorEl);

    const [openSignin, setOpenSignin] = useState(false);
    const [openSignup, setOpenSignup] = useState(false);

    const [user, setUser] = useState<UserType | null>(() => {
        if (typeof window !== "undefined") {
            const storedUser = sessionStorage.getItem("userData");
            return storedUser ? JSON.parse(storedUser) : null;
        }
        return null;
    });

const [sidebarOpen, setSidebarOpen] = useState(false);
const [selectedLocation, setSelectedLocation] = useState("New York");
const [searchQuery, setSearchQuery] = useState("");

const isLogin = !!user;

const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

// Load user from sessionStorage
// useEffect(() => {
//     const storedUser = sessionStorage.getItem("userData");
//     if (storedUser) {
//         setUser(JSON.parse(storedUser));
//     }
// }, []);

const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
};

const handleLocationClick = (event: React.MouseEvent<HTMLElement>) => {
    setLocationAnchorEl(event.currentTarget);
};

const handleMenuClose = () => {
    setAnchorEl(null);
};

const handleLocationClose = () => {
    setLocationAnchorEl(null);
};

const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    handleLocationClose();
};

const handleLogout = () => {
    // sessionStorage.removeItem("userData");
    // sessionStorage.removeItem("accessToken");
    // sessionStorage.removeItem("refreshToken");
    // sessionStorage.removeItem("role");
    sessionStorage.clear();

    setUser(null);
    handleMenuClose();

    // Force a state update to ensure re-render
    setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
    }, 100);
};

const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log("Search query:", searchQuery);
    if (isMobile) {
        handleSearchClose();
    }
};

const handleSearchClick = () => {
    setOpenSearchDrawer(true);
};

const handleSearchClose = () => {
    setOpenSearchDrawer(false);
};

const handleSidebarOpen = () => {
    setSidebarOpen(true);
};

const handleSidebarClose = () => {
    setSidebarOpen(false);
};

const locations = [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"
];

return (
    <Box>
        <AppBar position="sticky" className="app-bar">
            <Toolbar className="toolbar">
                {/* LOGO */}
                <Box className="logo-container">
                    <LocalMoviesIcon className="logo-icon" />
                    <Typography variant="h6" className="logo-text">
                        BookMyCinema
                    </Typography>
                </Box>

                {/* SEARCH AND LOCATION - Visible on medium screens and up */}
                {!isMobile && (
                    <Box className="search-location-container">
                        {/* Search Bar */}
                        <TextField
                            placeholder="Search for movies, cinemas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-field"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon className="search-icon" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Location Dropdown */}
                        <Box className="location-container">
                            <IconButton
                                onClick={handleLocationClick}
                                className="location-button"
                            >
                                <LocationOnIcon className="location-icon" />
                            </IconButton>
                            <Typography className="location-text">
                                {selectedLocation}
                            </Typography>

                            <Menu
                                anchorEl={locationAnchorEl}
                                open={openLocationMenu}
                                onClose={handleLocationClose}
                                className="location-menu"
                            >
                                {locations.map((location) => (
                                    <MenuItem
                                        key={location}
                                        onClick={() => handleLocationSelect(location)}
                                        className="location-menu-item"
                                    >
                                        {location}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    </Box>
                )}

                {/* RIGHT SIDE BUTTONS */}
                <Box className="right-container">
                    {/* Search Icon - Visible on mobile */}
                    {isMobile && (
                        <IconButton className="mobile-search-button">
                            <SearchIcon />
                        </IconButton>
                    )}

                    {/* Location Icon - Visible on mobile */}
                    {isMobile && (
                        <IconButton
                            onClick={handleLocationClick}
                            className="mobile-location-button"
                        >
                            <LocationOnIcon />
                        </IconButton>
                    )}

                    {/* Signup Button */}
                    {!isLogin && !isSmallMobile && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => setOpenSignup(true)}
                            className="signup-button"
                        >
                            Signup
                        </Button>
                    )}

                    {/* Avatar */}
                    <IconButton onClick={handleAvatarClick} className="avatar-button">
                        <Avatar
                            src={
                                user?.profilePicture
                                    ? user.profilePicture
                                    : "/default-avatar.png"
                            }
                            alt=""
                            className="avatar"
                        />
                    </IconButton>

                    {/* Menu Button */}
                    <IconButton
                        onClick={handleSidebarOpen}
                        className="menu-button">
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Sidebar
            open={sidebarOpen}
            onClose={handleSidebarClose}
            onLoginClick={() => {
                handleSidebarClose();
                setOpenSignin(true);
            }}
            onSignupClick={() => {
                handleSidebarClose();
                setOpenSignup(true);
            }}
            user={user}
        />

        {/* Mobile Search Drawer */}
        <Drawer
            anchor="top"
            open={openSearchDrawer}
            onClose={handleSearchClose}
            className="search-drawer"
        >
            <Box className="search-drawer-content">
                <form onSubmit={handleSearchSubmit} className="mobile-search-form">
                    <TextField
                        autoFocus
                        placeholder="Search for movies, cinemas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mobile-search-field"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon className="mobile-search-icon" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleSearchClose}>
                                        <CloseIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </form>
            </Box>
        </Drawer>

        {/* ====================== Avatar Dropdown Menu ====================== */}
        <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            className="avatar-menu"
        >
            {isLogin && (
                <MenuItem className="user-menu-item">
                    {user?.name || "User"}
                </MenuItem>
            )}

            {isLogin && (
                <MenuItem onClick={() => { }} className="menu-item">
                    Dashboard
                </MenuItem>
            )}

            {!isLogin && (
                <MenuItem
                    onClick={() => {
                        setOpenSignin(true);
                        handleMenuClose();
                    }}
                    className="menu-item"
                >
                    Login
                </MenuItem>
            )}

            {isLogin && <Divider className="menu-divider" />}

            {isLogin && (
                <MenuItem onClick={handleLogout} className="menu-item logout-item">
                    Logout
                </MenuItem>

            )}
        </Menu>

        {/* Location Menu for Mobile */}
        <Menu
            anchorEl={locationAnchorEl}
            open={openLocationMenu}
            onClose={handleLocationClose}
            className="mobile-location-menu"
        >
            {locations.map((location) => (
                <MenuItem
                    key={location}
                    onClick={() => handleLocationSelect(location)}
                    className="location-menu-item"
                >
                    {location}
                </MenuItem>
            ))}
        </Menu>

        {/* ====================== POPUP WINDOWS ====================== */}

        {/* Signin Popup */}
        <LoginModal
            open={openSignin}
            onClose={() => setOpenSignin(false)}
            onSwitchToSignup={() => {
                setOpenSignin(false);
                setOpenSignup(true);
            }}
            onLoginSuccess={(userData: UserType) => setUser(userData)}
        />

        {/* Signup Popup */}
        <SignupModal
            open={openSignup}
            onClose={() => setOpenSignup(false)}
            onSwitchToLogin={() => {
                setOpenSignup(false);
                setOpenSignin(true);
            }}
        />
    </Box>
);
}