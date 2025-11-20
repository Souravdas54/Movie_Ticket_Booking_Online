import axios from "axios";

import axiosInstance from "./axios.instance";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8500' // BACKEND - SERVER HTTP API

export const signup = async (formData: FormData) => {
    try {
        const res = await axios.post(`${API_URL}/auth/signup`, formData, {
            headers: { "Content-Type": "multipart/form-data" },

        })

        return res.data;
    } catch (error) {
        console.log(error);

    }
}

export const signin = async (formdata: { email: string, password: string }) => {
    try {
        const res = await axios.post(`${API_URL}/auth/signin`, formdata, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        console.log('API Response:', res);
        console.log('API Response data:', res.data);

        return res.data;

    } catch (error) {
        console.log(error);
    }
}

export const logout = async (role: string) => {
    try {
        const res = await axiosInstance.post(`${API_URL}/${role}/auth/logout`, {},
            {
                withCredentials: true
            }
        );
        window.location.href = '/'
        return res.data;

    } catch (error) {
        console.log("Logout faild", error);
    }
}