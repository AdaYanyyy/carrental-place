import React from "react";
import { Card, Rating } from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
// import { avgRate } from "../../utils";
import StarIcon from "@mui/icons-material/Star";
import _default from "@mui/material/styles/identifier";

import { defaultImage } from '../../image'

export default function SpaceCard(props) {

  const { item } = props;
  return (
    <Card sx={{ maxWidth: 550 }} className="space-card">
      <CardMedia component="img" height="270" image={item.img_path.includes('base64') ? item.img_path : defaultImage} />
      <CardContent>
        <p className="card-address">{item.location}</p >
        <p className="card-price">${item.day_price}/d</p >
        <p className="card-price">${item.hour_price}/h</p >
        <Typography variant="body2" color="text.secondary">
          <Rating
            size="small"
            value={item.rate}
            precision={0.5}
            readOnly
            emptyIcon={
              <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
            }
          />
        </Typography>
      </CardContent>
    </Card>
  );
}