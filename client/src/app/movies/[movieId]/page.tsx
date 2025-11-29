"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Container,
    Button,
    CircularProgress,
    Alert
} from "@mui/material";
import { AccessTime, CalendarToday, Language, Star } from "@mui/icons-material";
import { getMovieById } from "@/app/api/movie.endpoint";
// import ShowTimeSelector from "@/components/ShowTimeSelector";

interface Movie {
    _id: string;
    moviename: string;
    genre: string;
    language: string;
    duration: string;
    cast: string[];
    director: string[];
    releaseDate: string;
    description: string;
    poster: string;
    rating: number;
    votes?: number;
    likes?: number;
    promoted?: boolean;
}

const MovieDetailsPage = () => {
    //   const { movieId } = useParams<{ movieId: string }>();
    const params = useParams();
    const router = useRouter();
    const movieId = params?.movieId as string;

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!movieId) {
            setError("Movie ID not found");
            setLoading(false);
            return;
        }

        const fetchMovie = async () => {
            try {
                setLoading(true);
                setError("");
                // console.log('Fetching movie with ID:', movieId);

                const response = await getMovieById(movieId);

                const movieData = response?.data;

                // console.log('Movie data received:', movieData)

                if (movieData) {
                    // console.log('Setting movie data:', movieData);
                    setMovie(movieData);
                } else {
                    setError("Movie data not found");
                }
            } catch (err) {
                // console.error("Failed to load movie", err);
                setError("Failed to load movie");
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [movieId]);

    const handleBooking = () => {
        if (movieId) {
            router.push(`/theaters/${movieId}`);
        }
        console.log("Movie id and go theater page", movieId);

    };

    if (loading) {
        return (
            <Box sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #e11d48 0%, #f97316 50%, #e11d48 100%)",
                }
            }}>
                <Box sx={{
                    textAlign: "center",
                    background: "rgba(248, 248, 248, 0.8)",
                    padding: { xs: "2rem", sm: "3rem", md: "4rem" },
                    borderRadius: "1.5rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}>
                    <CircularProgress
                        sx={{
                            color: "#e11d48",
                            width: "60px !important",
                            height: "60px !important",
                            mb: 3
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            color: "#f8fafc",
                            fontWeight: 600,
                            fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" }
                        }}
                    >
                        Loading Movie...
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 3,
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)",
                }
            }}>
                <Alert
                    severity="error"
                    sx={{
                        maxWidth: { xs: "90%", sm: 500, md: 600, lg: 700, xl: 800 },
                        textAlign: 'center',
                        background: "rgba(220, 38, 38, 0.1)",
                        border: "1px solid rgba(220, 38, 38, 0.3)",
                        borderRadius: "1.5rem",
                        padding: { xs: "2rem", sm: "3rem" },
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 20px 40px -12px rgba(220, 38, 38, 0.3)",
                        '& .MuiAlert-message': {
                            width: '100%',
                            padding: 0
                        }
                    }}
                >
                    <Typography variant="h4" gutterBottom sx={{
                        fontWeight: 700,
                        color: "#fecaca",
                        fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" }
                    }}>
                        Oops! Something Went Wrong
                    </Typography>
                    <Typography sx={{
                        color: "#fca5a5",
                        mb: 4,
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                        lineHeight: 1.6
                    }}>
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            mt: 2,
                            background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                            borderRadius: "0.75rem",
                            px: { xs: 3, sm: 4, md: 5 },
                            py: { xs: 1, sm: 1.25 },
                            fontWeight: 700,
                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                            minWidth: { xs: "140px", sm: "160px", md: "180px" },
                            "&:hover": {
                                background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 12px 25px rgba(220, 38, 38, 0.4)"
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        onClick={() => router.push('/movies')}
                    >
                        Back to Movies
                    </Button>
                </Alert>
            </Box>
        );
    }

    if (!movie) {
        return (
            <Box sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 3,
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)",
                }
            }}>
                <Alert
                    severity="warning"
                    sx={{
                        maxWidth: { xs: "90%", sm: 500, md: 600, lg: 700, xl: 800 },
                        textAlign: 'center',
                        background: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "1.5rem",
                        padding: { xs: "2rem", sm: "3rem" },
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 20px 40px -12px rgba(245, 158, 11, 0.3)",
                        '& .MuiAlert-message': {
                            width: '100%',
                            padding: 0
                        }
                    }}
                >
                    <Typography variant="h4" gutterBottom sx={{
                        fontWeight: 700,
                        color: "#fef3c7",
                        fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" }
                    }}>
                        Movie Not Found
                    </Typography>
                    <Typography sx={{
                        color: "#fde68a",
                        mb: 4,
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                        lineHeight: 1.6
                    }}>
                        The movie you&apos;re looking for doesn&apos;t exist or may have been removed.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            mt: 2,
                            background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                            borderRadius: "0.75rem",
                            px: { xs: 3, sm: 4, md: 5 },
                            py: { xs: 1, sm: 1.25 },
                            fontWeight: 700,
                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                            minWidth: { xs: "140px", sm: "160px", md: "180px" },
                            color: "#1c1917",
                            "&:hover": {
                                background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 12px 25px rgba(245, 158, 11, 0.4)"
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        onClick={() => router.push('/movies')}
                    >
                        Browse Movies
                    </Button>
                </Alert>
            </Box>
        );
    }

    const genreArray = movie.genre ? movie.genre.split(',').map(g => g.trim()) : [];

    return (
        <Box sx={{
            width: "100%",
            backgroundColor: "#3f4450ff",
            color: "#fff",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 100%)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                // height: "4px",
                // background: "linear-gradient(90deg, #e11d48 0%, #f97316 25%, #eab308 50%, #22c55e 75%, #3b82f6 100%)",
                // zIndex: 1000
            }
        }}>
            <Box
                sx={{
                    width: "100%",
                    minHeight: { xs: "auto", sm: "60vh", md: "70vh", lg: "80vh", xl: "85vh" },
                    backgroundImage: ` url(${movie.poster})`,
                    // backgroundImage: `linear-gradient(to bottom, 
                    //     rgba(15, 23, 42, 0.95) 0%, 
                    //     rgba(15, 23, 42, 0.85) 30%, 
                    //     rgba(15, 23, 42, 0.7) 50%,
                    //     rgba(15, 23, 42, 0.9) 100%),
                        // url(${movie.poster})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: { xs: "scroll", md: "fixed" },
                    display: "flex",
                    alignItems: "center",
                    py: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 },
                    position: "relative",
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "150px",
                        // background: "linear-gradient(to top, #0f172a, transparent)",
                        zIndex: 1
                    }
                }}
            >
                <Container maxWidth="xl" sx={{
                    position: "relative",
                    zIndex: 2,
                    px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }
                }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", lg: "row" },
                            gap: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 },
                            alignItems: { xs: "center", lg: "flex-start" },
                            textAlign: { xs: "center", lg: "left" },
                            maxWidth: { xxl: "1400px" },
                            margin: { xxl: "0 auto" }
                        }}
                    >
                        <Box
                            component="img"
                            src={movie.poster}
                            alt={movie.moviename}
                            sx={{
                                width: {
                                    xs: "280px",
                                    sm: "320px",
                                    md: "360px",
                                    lg: "400px",
                                    xl: "450px",
                                    xxl: "500px"
                                },
                                height: {
                                    xs: "400px",
                                    sm: "450px",
                                    md: "500px",
                                    lg: "560px",
                                    xl: "620px",
                                    xxl: "700px"
                                },
                                borderRadius: { xs: "1rem", sm: "1.5rem", md: "2rem" },
                                boxShadow: `
                                    0 0 0 1px rgba(255, 255, 255, 0.1),
                                    0 25px 50px -12px rgba(0, 0, 0, 0.8),
                                    0 0 50px rgba(225, 29, 72, 0.3)
                                `,
                                objectFit: "cover",
                                flexShrink: 0,
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                    transform: "translateY(-8px) scale(1.02)",
                                    boxShadow: `
                                        0 0 0 1px rgba(255, 255, 255, 0.2),
                                        0 35px 60px -12px rgba(0, 0, 0, 0.9),
                                        0 0 80px rgba(225, 29, 72, 0.5)
                                    `
                                }
                            }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/movie-placeholder.jpg';
                            }}
                        />

                        <Box sx={{
                            maxWidth: { xs: "100%", lg: "600px", xl: "700px", xxl: "800px" },
                            flex: 1,
                            px: { xs: 1, sm: 2, md: 0 }
                        }}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontWeight: 900,
                                    mb: { xs: 2, sm: 3, md: 4 },
                                    fontSize: {
                                        xs: '2.25rem',
                                        sm: '3rem',
                                        md: '3.5rem',
                                        lg: '4rem',
                                        xl: '4.5rem',
                                        xxl: '5rem'
                                    },
                                    lineHeight: 1.1,
                                    background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #94a3b8 100%)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
                                }}
                            >
                                {movie.moviename}
                            </Typography>

                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: { xs: 2, sm: 3, md: 4 },
                                mb: { xs: 3, sm: 4, md: 5 },
                                justifyContent: { xs: "center", lg: "flex-start" }
                            }}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    background: "rgba(225, 29, 72, 0.2)",
                                    padding: { xs: "0.5rem 1rem", sm: "0.75rem 1.5rem" },
                                    borderRadius: "2rem",
                                    border: "1px solid rgba(225, 29, 72, 0.3)",
                                    backdropFilter: "blur(10px)"
                                }}>
                                    <Star sx={{ color: "#fbbf24", fontSize: { xs: 20, sm: 24, md: 28 } }} />
                                    <Typography sx={{
                                        color: "#fbbf24",
                                        fontWeight: 700,
                                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }
                                    }}>
                                        {movie.rating}/10
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    background: "rgba(59, 130, 246, 0.2)",
                                    padding: { xs: "0.5rem 1rem", sm: "0.75rem 1.5rem" },
                                    borderRadius: "2rem",
                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                    backdropFilter: "blur(10px)"
                                }}>
                                    <AccessTime sx={{ color: "#60a5fa", fontSize: { xs: 18, sm: 22, md: 26 } }} />
                                    <Typography sx={{
                                        color: "#bfdbfe",
                                        fontWeight: 600,
                                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }
                                    }}>
                                        {movie.duration}
                                    </Typography>
                                </Box>

                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    background: "rgba(34, 197, 94, 0.2)",
                                    padding: { xs: "0.5rem 1rem", sm: "0.75rem 1.5rem" },
                                    borderRadius: "2rem",
                                    border: "1px solid rgba(34, 197, 94, 0.3)",
                                    backdropFilter: "blur(10px)"
                                }}>
                                    <Language sx={{ color: "#4ade80", fontSize: { xs: 18, sm: 22, md: 26 } }} />
                                    <Typography sx={{
                                        color: "#bbf7d0",
                                        fontWeight: 600,
                                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }
                                    }}>
                                        {movie.language}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: { xs: 1, sm: 1.5, md: 2 },
                                mb: { xs: 3, sm: 4, md: 5 },
                                justifyContent: { xs: "center", lg: "flex-start" }
                            }}>
                                {genreArray.map((genre, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            px: { xs: 2, sm: 3, md: 4 },
                                            py: { xs: 0.75, sm: 1, md: 1.25 },
                                            background: "linear-gradient(135deg, #e11d48 0%, #f97316 100%)",
                                            borderRadius: { xs: "1rem", sm: "1.5rem", md: "2rem" },
                                            border: "1px solid rgba(255, 255, 255, 0.2)",
                                            boxShadow: "0 8px 25px rgba(225, 29, 72, 0.3)",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            "&:hover": {
                                                transform: "translateY(-2px) scale(1.05)",
                                                boxShadow: "0 12px 35px rgba(225, 29, 72, 0.5)"
                                            }
                                        }}
                                    >
                                        <Typography variant="body2" sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.9rem" },
                                            color: "white",
                                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)"
                                        }}>
                                            {genre}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Typography
                                sx={{
                                    color: "#e2e8f0",
                                    mb: { xs: 4, sm: 5, md: 6 },
                                    lineHeight: 1.8,
                                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem", lg: "1.25rem" },
                                    textAlign: { xs: "center", lg: "left" },
                                    // background: "rgba(30, 41, 59, 0.5)",
                                    padding: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                                    borderRadius: "1.5rem",
                                    // border: "1px solid rgba(255, 255, 255, 0.1)",
                                    // backdropFilter: "blur(10px)",
                                    // boxShadow: "0 15px 35px -12px rgba(0, 0, 0, 0.4)"
                                }}
                            >
                                {movie.description}
                            </Typography>

                            <Box sx={{
                                mb: { xs: 4, sm: 5, md: 6 },
                                // background: "rgba(15, 23, 42, 0.7)",
                                padding: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                                borderRadius: "1.5rem",
                                // border: "1px solid rgba(255, 255, 255, 0.1)",
                                // backdropFilter: "blur(10px)",
                                // boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.5)"
                            }}>
                                <Typography variant="h4" sx={{
                                    mb: { xs: 2, sm: 3, md: 4 },
                                    color: "#f8fafc",
                                    fontWeight: 800,
                                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                                    textAlign: { xs: "center", lg: "left" },
                                    background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}>
                                    Movie Details
                                </Typography>
                                <Box sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "1fr 1fr",
                                        lg: "1fr 1fr 1fr",
                                        xl: "1fr 1fr 1fr 1fr"
                                    },
                                    gap: { xs: 2, sm: 3, md: 4 },
                                    textAlign: { xs: "center", sm: "left" }
                                }}>
                                    <Box sx={{
                                        padding: { xs: "1rem", sm: "1.25rem" },
                                        background: "rgba(30, 41, 59, 0.6)",
                                        borderRadius: "1rem",
                                        border: "1px solid rgba(255, 255, 255, 0.05)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: "rgba(30, 41, 59, 0.8)",
                                            transform: "translateY(-2px)"
                                        }
                                    }}>
                                        <Typography sx={{
                                            color: "#94a3b8",
                                            fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                                            fontWeight: 600,
                                            mb: 1
                                        }}>
                                            Release Date
                                        </Typography>
                                        <Typography sx={{
                                            color: "#e2e8f0",
                                            fontWeight: 700,
                                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }
                                        }}>
                                            {movie.releaseDate}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        padding: { xs: "1rem", sm: "1.25rem" },
                                        background: "rgba(30, 41, 59, 0.6)",
                                        borderRadius: "1rem",
                                        border: "1px solid rgba(255, 255, 255, 0.05)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: "rgba(30, 41, 59, 0.8)",
                                            transform: "translateY(-2px)"
                                        }
                                    }}>
                                        <Typography sx={{
                                            color: "#94a3b8",
                                            fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                                            fontWeight: 600,
                                            mb: 1
                                        }}>
                                            Director{movie.director.length > 1 ? 's' : ''}
                                        </Typography>
                                        <Typography sx={{
                                            color: "#e2e8f0",
                                            fontWeight: 700,
                                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }
                                        }}>
                                            {movie.director.join(', ')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        padding: { xs: "1rem", sm: "1.25rem" },
                                        background: "rgba(30, 41, 59, 0.6)",
                                        borderRadius: "1rem",
                                        border: "1px solid rgba(255, 255, 255, 0.05)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: "rgba(30, 41, 59, 0.8)",
                                            transform: "translateY(-2px)"
                                        }
                                    }}>
                                        <Typography sx={{
                                            color: "#94a3b8",
                                            fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                                            fontWeight: 600,
                                            mb: 1
                                        }}>
                                            Cast
                                        </Typography>
                                        <Typography sx={{
                                            color: "#e2e8f0",
                                            fontWeight: 700,
                                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }
                                        }}>
                                            {movie.cast.slice(0, 3).join(', ')}
                                            {movie.cast.length > 3 && '...'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        padding: { xs: "1rem", sm: "1.25rem" },
                                        background: "rgba(30, 41, 59, 0.6)",
                                        borderRadius: "1rem",
                                        border: "1px solid rgba(255, 255, 255, 0.05)",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: "rgba(30, 41, 59, 0.8)",
                                            transform: "translateY(-2px)"
                                        }
                                    }}>
                                        <Typography sx={{
                                            color: "#94a3b8",
                                            fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                                            fontWeight: 600,
                                            mb: 1
                                        }}>
                                            Votes
                                        </Typography>
                                        <Typography sx={{
                                            color: "#e2e8f0",
                                            fontWeight: 700,
                                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }
                                        }}>
                                            {movie.votes?.toLocaleString() || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{
                                textAlign: { xs: "center", lg: "left" },
                                position: "relative",
                                zIndex: 10
                            }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<CalendarToday sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />}
                                    onClick={handleBooking}
                                    sx={{
                                        background: "linear-gradient(135deg, #e11d48 0%, #ef4444 50%, #dc2626 100%)",
                                        px: { xs: 4, sm: 5, md: 6, lg: 8 },
                                        py: { xs: 1.25, sm: 1.5, md: 1.75, lg: 2 },
                                        fontWeight: 800,
                                        borderRadius: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem", lg: "1.5rem" },
                                        minWidth: { xs: "220px", sm: "260px", md: "300px", lg: "350px" },
                                        height: { xs: "56px", sm: "64px", md: "72px", lg: "80px" },
                                        boxShadow: `
                                            0 0 20px rgba(225, 29, 72, 0.5),
                                            0 15px 35px -12px rgba(225, 29, 72, 0.6),
                                            inset 0 1px 0 rgba(255, 255, 255, 0.2)
                                        `,
                                        textTransform: "uppercase",
                                        letterSpacing: { xs: "0.5px", sm: "1px", md: "1.5px" },
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #be123c 0%, #b91c1c 50%, #991b1b 100%)",
                                            transform: "translateY(-3px) scale(1.02)",
                                            boxShadow: `
                                                0 0 30px rgba(225, 29, 72, 0.7),
                                                0 25px 50px -12px rgba(225, 29, 72, 0.8),
                                                inset 0 1px 0 rgba(255, 255, 255, 0.3)
                                            `
                                        },
                                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                        position: "relative",
                                        overflow: "hidden",
                                        "&::before": {
                                            content: '""',
                                            position: "absolute",
                                            top: 0,
                                            left: "-100%",
                                            width: "100%",
                                            height: "100%",
                                            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                                            transition: "left 0.6s ease"
                                        },
                                        "&:hover::before": {
                                            left: "100%"
                                        }
                                    }}
                                >
                                    Book Tickets Now
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* <ShowTimeSelector movieId={movieId} /> */}

                </Container>
            </Box>
        </Box>
    );
}

export default MovieDetailsPage;