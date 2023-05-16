import { Grid, Typography } from "@mui/material";
import Chip from "@mui/material/Chip";
import React from "react";
import Avatar from '@mui/material/Avatar';

export const dbListColumns = () => [
  {
    name: "name",
    label: "Name",
    options: {
      filter: false,
      sort: true,
      display: true,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "type",
    label: "Type",
    options: {
        filter: true,
        sort: true,
        display: true,
        setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "tier",
    label: "Tier",
    options: {
        filter: true,
        sort: true,
        display: true,
        setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "capacity",
    label: "Capacity",
    options: {
        filter: true,
        sort: true,
        display: true,
        setCellProps: () => ({ style: { whiteSpace: "pre" } })
    },
  },
  {
    name: "location",
    label: "Location",
    options: {
        filter: true,
        sort: true,
        display: true,
        setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "hasReadReplica",
    label: "Has Read Replica",
    options: {
        filter: true,
        sort: true,
        display: true,
        setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    }
  },
  {
    name: "hasGeoReplica",
    label: "Has Geo Replica",
    options: {
        filter: true,
        sort: true,
        display: true,
        setCellProps: () => ({ style: { whiteSpace: "pre" } })
    }
  },
  {
    name: "id",
    label: "",
    options: {
      filter: false,
      sort: false,
      display: false,
      setCellProps: () => ({ style: { whiteSpace: "pre" } }),
    },
  },
  {
    name: "onboardStatus",
    label: "Onboard Status",
    options: {
        filter: true,
        sort: true,
        display: true,
        setCellProps: () => ({ style: { whiteSpace: "pre" } }),
        customBodyRender: (value: any) => value == "ONBOARDED" ? "ONBOARDED" : "YET_TO_ONBOARD"
    },
  },
];
