"use client";

import React, { useEffect, useState } from "react";
import {Drawer,Box,Typography,Button,Divider,List,ListItem,ListItemIcon,ListItemText,IconButton,Badge,} from "@mui/material";
import { Close,Notifications, ShoppingBag, VideoLibrary, CreditCard, Help, Settings, CardGiftcard, SwapHoriz, LocationOn,} from "@mui/icons-material";
import "./sidebarstyle.css";
import { UserType } from "@/types/usertype";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  user: unknown;
}

export default function Sidebar({open,onClose,onLoginClick,onSignupClick,}: SidebarProps) {
    
    const [user, setUser] = useState<UserType | null>(null);
    
    
    useEffect(() => {
        const storedUser = sessionStorage.getItem("userData");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const isLoggedIn = !!user;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      className="sidebar-drawer"
    >
      <Box className="sidebar-content">
        {/* Header */}
        <Box className="sidebar-header">
          <Typography variant="h6" className="sidebar-title">
              {isLoggedIn ? `Hey! ${user?.name}` : "Hey!"}
          </Typography>
          <IconButton onClick={onClose} className="close-button">
            <Close />
          </IconButton>
        </Box>

        {/* Login/Signup Section */}
        {!isLoggedIn && (
          <Box className="login-section">
            {/* <Typography className="login-title">
              Unlock special offers & great benefits
            </Typography> */}
            <Box className="login-buttons">
              <Button
                variant="outlined"
                className="login-button"
                onClick={onLoginClick}
              >
                Login
              </Button>
              <Button
                variant="contained"
                className="register-button"
                onClick={onSignupClick}
              >
                Register
              </Button>
            </Box>
          </Box>
        )}

        <Divider className="section-divider" />

        {/* Notifications Section */}
        <Box className="section">
          <Typography className="section-title">Notifications</Typography>
          <List className="menu-list">
            <ListItem className="menu-item">
              <ListItemIcon className="menu-icon">
                <Badge badgeContent={3} color="error">
                  <ShoppingBag />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary="Your Orders"
                secondary="View all your bookings & purchases"
                className="menu-text"
              />
            </ListItem>
            <ListItem className="menu-item">
              <ListItemIcon className="menu-icon">
                <VideoLibrary />
              </ListItemIcon>
              <ListItemText
                primary="Stream Library"
                secondary="Rented & Purchased Movies"
                className="menu-text"
              />
            </ListItem>
          </List>
        </Box>

        <Divider className="section-divider" />

        {/* Play Credit Card */}
        <ListItem className="menu-item">
          <ListItemIcon className="menu-icon">
            <CreditCard />
          </ListItemIcon>
          <ListItemText
            primary="Play Credit Card"
            secondary="View your Play Credit Card details and offers"
            className="menu-text"
          />
        </ListItem>

        <Divider className="section-divider" />

        {/* Help & Support */}
        <Box className="section">
          <ListItem className="menu-item">
            <ListItemIcon className="menu-icon">
              <Help />
            </ListItemIcon>
            <ListItemText
              primary="Help & Support"
              secondary="View commonly asked queries and Chat"
              className="menu-text"
            />
          </ListItem>

          <List className="submenu-list">
            <ListItem className="submenu-item">
              <ListItemIcon className="submenu-icon">
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary="Accounts & Settings"
                secondary="Location, Payments, Permissions & More"
                className="submenu-text"
              />
            </ListItem>
            <ListItem className="submenu-item">
              <ListItemIcon className="submenu-icon">
                <CardGiftcard />
              </ListItemIcon>
              <ListItemText
                primary="Rewards"
                secondary="View your rewards & unlock new ones"
                className="submenu-text"
              />
            </ListItem>
            <ListItem className="submenu-item">
              <ListItemIcon className="submenu-icon">
                <SwapHoriz />
              </ListItemIcon>
              <ListItemText
                primary="Book&Change"
                className="submenu-text"
              />
            </ListItem>
          </List>
        </Box>

        {/* Location Section */}
        {isLoggedIn && (
          <>
            <Divider className="section-divider" />
            <ListItem className="menu-item">
              <ListItemIcon className="menu-icon">
                <LocationOn />
              </ListItemIcon>
              <ListItemText
                primary="Location"
                secondary={user?.location || "Select your location"}
                className="menu-text"
              />
            </ListItem>
          </>
        )}
      </Box>
    </Drawer>
  );
}