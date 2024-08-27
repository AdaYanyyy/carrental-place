import React, { useState } from "react";
import { Rating, Box } from "@mui/material";
import Button from "@mui/material/Button";
import StarIcon from "@mui/icons-material/Star";
import TextField from "@mui/material/TextField";

const labels = {
    0.5: "Useless",
    1: "Useless+",
    1.5: "Poor",
    2: "Poor+",
    2.5: "Ok",
    3: "Ok+",
    3.5: "Good",
    4: "Good+",
    4.5: "Excellent",
    5: "Excellent+",
};

function getLabelText(value) {
    return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}
const defaultRate = 4.5;

export default function ReviewForm(props) {
    const [value, setValue] = useState(defaultRate);
    const [hover, setHover] = useState(-1);
    const [comment, setComment] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        const formJson = Object.fromEntries(
            new FormData(event.currentTarget).entries()
        );
        formJson.rate = Number(formJson.rate);
        console.log("data", formJson);
        props.submitReview(formJson);
        setComment("");
        setValue(defaultRate);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Rating
                    name="rate"
                    value={value}
                    precision={0.5}
                    getLabelText={getLabelText}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                    }}
                    onChangeActive={(event, newHover) => {
                        setHover(newHover);
                    }}
                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                />
                {value !== null && (
                    <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
                )}
            </Box>
            <TextField
                margin="normal"
                required
                multiline
                minRows={3}
                fullWidth
                id="comment"
                label="leave up your comment"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                autoFocus
            />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Submit
            </Button>
        </Box>
    );
}