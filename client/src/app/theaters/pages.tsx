"use client";
import React from "react";
import { Box, Container, Typography } from "@mui/material";

export default function TheatersRootPage() {
  return (
    <Box sx={{ minHeight: "60vh", pt: 6, pb: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>Find Theaters</Typography>
        <Typography color="text.secondary">Select a movie first to view theaters showing that movie, or use search to find nearby theaters.</Typography>
        {/* You can add a search / map here later */}
      </Container>
    </Box>
  );
}



// "use client";
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//     Box,
//     Typography,
//     Container,
//     Card,
//     CardContent,
//     Button,
//     CircularProgress,
//     Alert,
//     TextField,
//     MenuItem,
//     Grid
// } from "@mui/material";
// import { LocationOn, Phone, ConfirmationNumber } from "@mui/icons-material";
// import { getNearbyTheaters, getTheatersByDistrict, getTheatersByState } from "../api/theather.endpoint";
// import { Theater } from "@/types/theater";

// export default function TheatersPage() {
//     const router = useRouter();
//     const [theaters, setTheaters] = useState<Theater[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [searchType, setSearchType] = useState<"location" | "state" | "district">("location");
//     const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

//     // Sample data for dropdowns
//     const states = ["West Bengal", "Maharashtra", "Karnataka", "Tamil Nadu", "Delhi"];
//     const districts = ["Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas", "Hooghly"];

//     useEffect(() => {
//         // Get user's current location
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     setUserLocation({
//                         latitude: position.coords.latitude,
//                         longitude: position.coords.longitude
//                     });
//                 },
//                 (error) => {
//                     console.error("Error getting location:", error);
//                     setError("Unable to get your location. Please search by state or district.");
//                 }
//             );
//         }

//         fetchTheaters();
//     }, []);

//     const fetchTheaters = async (type: "location" | "state" | "district" = "location", value?: string) => {
//         try {
//             setLoading(true);
//             setError("");

//             let response;

//             switch (type) {
//                 case "location":
//                     if (userLocation) {
//                         response = await getNearbyTheaters({
//                             latitude: userLocation.latitude,
//                             longitude: userLocation.longitude,
//                             maxDistance: 50000 // 50km
//                         });
//                     } else {
//                         // Fallback to West Bengal theaters if location not available
//                         response = await getTheatersByState({ state: "West Bengal" });
//                     }
//                     break;

//                 case "state":
//                     response = await getTheatersByState({ state: value || "West Bengal" });
//                     break;

//                 case "district":
//                     response = await getTheatersByDistrict({ district: value || "Kolkata" });
//                     break;

//                 default:
//                     response = await getTheatersByState({ state: "West Bengal" });
//             }

//             setTheaters(response.data || []);
//         } catch (err: unknown) {
//             console.error("Failed to load theaters", err);
//             setError(err instanceof Error ? err.message : "Failed to load theaters");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSearchByState = (state: string) => {
//         setSearchType("state");
//         fetchTheaters("state", state);
//     };

//     const handleSearchByDistrict = (district: string) => {
//         setSearchType("district");
//         fetchTheaters("district", district);
//     };

//     const handleTheaterSelect = (theaterId: string) => {
//         router.push(`/theaters/${theaterId}`);
//     };

//     const handleViewMovies = (theaterId: string) => {
//         router.push(`/theaters/${theaterId}/movies`);
//     };

//     if (loading) {
//         return (
//             <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
//                 <CircularProgress />
//             </Box>
//         );
//     }

//     return (
//         <Box sx={{ backgroundColor: "#0f172a", color: "white", minHeight: "100vh", py: 4 }}>
//             <Container maxWidth="lg">
//                 {/* Header */}
//                 <Box sx={{ textAlign: "center", mb: 6 }}>
//                     <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
//                         Find Theaters
//                     </Typography>
//                     <Typography variant="h6" color="#94a3b8" gutterBottom>
//                         Discover theaters near you
//                     </Typography>
//                 </Box>

//                 {/* Search Options */}
//                 <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)", mb: 4 }}>
//                     <CardContent sx={{ p: 3 }}>
//                         <Typography variant="h6" gutterBottom>
//                             Search Theaters
//                         </Typography>
//                         <Grid container spacing={2}>
//                             <Grid item xs={12} md={4}>
//                                 <Button
//                                     fullWidth
//                                     variant={searchType === "location" ? "contained" : "outlined"}
//                                     onClick={() => fetchTheaters("location")}
//                                     sx={{
//                                         backgroundColor: searchType === "location" ? "#3b82f6" : "transparent",
//                                         borderColor: "#3b82f6",
//                                         color: searchType === "location" ? "white" : "#3b82f6"
//                                     }}
//                                 >
//                                     Near Me
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={12} md={4}>
//                                 <TextField
//                                     fullWidth
//                                     select
//                                     label="Search by State"
//                                     value=""
//                                     onChange={(e) => handleSearchByState(e.target.value)}
//                                     sx={{
//                                         '& .MuiOutlinedInput-root': {
//                                             '& fieldset': { borderColor: '#4b5563' },
//                                             '&:hover fieldset': { borderColor: '#6b7280' },
//                                             '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
//                                         },
//                                         '& .MuiInputLabel-root': { color: '#9ca3af' },
//                                         '& .MuiInputBase-input': { color: 'white' },
//                                         '& .MuiSvgIcon-root': { color: '#9ca3af' }
//                                     }}
//                                 >
//                                     <MenuItem value="">Select State</MenuItem>
//                                     {states.map((state) => (
//                                         <MenuItem key={state} value={state}>
//                                             {state}
//                                         </MenuItem>
//                                     ))}
//                                 </TextField>
//                             </Grid>
//                             <Grid item xs={12} md={4}>
//                                 <TextField
//                                     fullWidth
//                                     select
//                                     label="Search by District"
//                                     value=""
//                                     onChange={(e) => handleSearchByDistrict(e.target.value)}
//                                     sx={{
//                                         '& .MuiOutlinedInput-root': {
//                                             '& fieldset': { borderColor: '#4b5563' },
//                                             '&:hover fieldset': { borderColor: '#6b7280' },
//                                             '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
//                                         },
//                                         '& .MuiInputLabel-root': { color: '#9ca3af' },
//                                         '& .MuiInputBase-input': { color: 'white' },
//                                         '& .MuiSvgIcon-root': { color: '#9ca3af' }
//                                     }}
//                                 >
//                                     <MenuItem value="">Select District</MenuItem>
//                                     {districts.map((district) => (
//                                         <MenuItem key={district} value={district}>
//                                             {district}
//                                         </MenuItem>
//                                     ))}
//                                 </TextField>
//                             </Grid>
//                         </Grid>
//                     </CardContent>
//                 </Card>

//                 {/* Error Message */}
//                 {error && (
//                     <Alert severity="error" sx={{ mb: 3 }}>
//                         {error}
//                     </Alert>
//                 )}

//                 {/* Theaters List */}
//                 {theaters.length === 0 ? (
//                     <Box sx={{ textAlign: "center", py: 8 }}>
//                         <Typography variant="h6" color="#94a3b8">
//                             No theaters found
//                         </Typography>
//                         <Typography variant="body2" color="#64748b" sx={{ mt: 1 }}>
//                             Try searching in a different area or check back later.
//                         </Typography>
//                     </Box>
//                 ) : (
//                     <Grid container spacing={3}>
//                         {theaters.map((theater) => (
//                             <Grid item xs={12} md={6} key={theater._id}>
//                                 <Card sx={{
//                                     backgroundColor: "rgba(255, 255, 255, 0.05)",
//                                     border: "1px solid rgba(255, 255, 255, 0.1)",
//                                     height: "100%",
//                                     transition: "all 0.3s ease",
//                                     '&:hover': {
//                                         transform: "translateY(-4px)",
//                                         boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
//                                         borderColor: "#3b82f6"
//                                     }
//                                 }}>
//                                     <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
//                                         {/* Theater Header */}
//                                         <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
//                                             <Box
//                                                 sx={{
//                                                     width: 50,
//                                                     height: 50,
//                                                     backgroundColor: "#3b82f6",
//                                                     borderRadius: 2,
//                                                     display: "flex",
//                                                     alignItems: "center",
//                                                     justifyContent: "center",
//                                                     mr: 2,
//                                                     fontWeight: "bold",
//                                                     fontSize: "1.2rem",
//                                                     flexShrink: 0
//                                                 }}
//                                             >
//                                                 {theater.theatername.charAt(0)}
//                                             </Box>
//                                             <Box sx={{ flex: 1 }}>
//                                                 <Typography variant="h6" component="h2" gutterBottom>
//                                                     {theater.theatername}
//                                                 </Typography>
//                                                 <Box sx={{ display: "flex", alignItems: "center", color: "#94a3b8", mb: 1 }}>
//                                                     <LocationOn sx={{ fontSize: 16, mr: 1 }} />
//                                                     <Typography variant="body2">
//                                                         {theater.district}, {theater.state}
//                                                     </Typography>
//                                                 </Box>
//                                                 <Box sx={{ display: "flex", alignItems: "center", color: "#94a3b8" }}>
//                                                     <Phone sx={{ fontSize: 16, mr: 1 }} />
//                                                     <Typography variant="body2">
//                                                         {theater.contact}
//                                                     </Typography>
//                                                 </Box>
//                                             </Box>
//                                         </Box>

//                                         {/* Theater Details */}
//                                         <Box sx={{ mb: 3, flex: 1 }}>
//                                             <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
//                                                 <Typography variant="body2" color="#94a3b8">Screens:</Typography>
//                                                 <Typography variant="body2" color="white">{theater.screens}</Typography>
//                                             </Box>
//                                             <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
//                                                 <Typography variant="body2" color="#94a3b8">Movies:</Typography>
//                                                 <Typography variant="body2" color="white">
//                                                     {theater.assignedMovies.length} playing
//                                                 </Typography>
//                                             </Box>
//                                         </Box>

//                                         {/* Action Buttons */}
//                                         <Box sx={{ display: "flex", gap: 1 }}>
//                                             <Button
//                                                 variant="outlined"
//                                                 size="small"
//                                                 fullWidth
//                                                 onClick={() => handleTheaterSelect(theater._id)}
//                                                 sx={{
//                                                     borderColor: "#3b82f6",
//                                                     color: "#3b82f6",
//                                                     '&:hover': {
//                                                         borderColor: "#2563eb",
//                                                         backgroundColor: "rgba(59, 130, 246, 0.1)"
//                                                     }
//                                                 }}
//                                             >
//                                                 View Details
//                                             </Button>
//                                             <Button
//                                                 variant="contained"
//                                                 size="small"
//                                                 fullWidth
//                                                 onClick={() => handleViewMovies(theater._id)}
//                                                 startIcon={<ConfirmationNumber />}
//                                                 sx={{
//                                                     backgroundColor: "#10b981",
//                                                     '&:hover': {
//                                                         backgroundColor: "#059669"
//                                                     }
//                                                 }}
//                                             >
//                                                 Book Tickets
//                                             </Button>
//                                         </Box>
//                                     </CardContent>
//                                 </Card>
//                             </Grid>
//                         ))}
//                     </Grid>
//                 )}

//                 {/* Back Button */}
//                 <Box sx={{ textAlign: "center", mt: 4 }}>
//                     <Button
//                         variant="outlined"
//                         onClick={() => router.push('/movies')}
//                         sx={{
//                             borderColor: "#94a3b8",
//                             color: "#94a3b8",
//                             '&:hover': {
//                                 borderColor: "#cbd5e1",
//                                 color: "#cbd5e1",
//                             }
//                         }}
//                     >
//                         Back to Movies
//                     </Button>
//                 </Box>
//             </Container>
//         </Box>
//     );
// }