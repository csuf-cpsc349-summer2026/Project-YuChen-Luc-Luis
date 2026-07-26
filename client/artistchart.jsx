{/* import React from "react"
import {
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Cell,
    PieChart,
    Pie
} from 'recharts';

export default function ArtistChart({ popularity, genres = []}) {
    // Format popularity score (0-100)
    const popularityData = [
        {label: 'Popularity Score', score: popularity ?? 0 }
    ];
    //Arist gengres into slice data for Pie Chart
    const genreData = genres.length ? genres.slice(0,5).map((genre)) => ({
        name: genre.toUpperCase(),
        value: 1
    })
}