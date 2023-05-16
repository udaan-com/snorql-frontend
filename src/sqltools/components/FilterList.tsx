import React from 'react';
import { TextField } from '@mui/material';
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

interface Props {
    handleFilter(data: any): any

}
export interface IContainer {
    containerName: string;
    isShow: boolean;
}

export const FilterList: React.FunctionComponent<Props> = (props: Props) => {

    const searchAndFilter = (event: any) => {
        let inputValue: string = event.target.value;
        props.handleFilter((container: any) => container.map((x: any) => x["name"].match(inputValue) ? { ...x, isShow: true } : { ...x, isShow: false }))
    }

    return (
        <div style={{ width: "100%", paddingTop: "10px", paddingBottom: "10px" }} >

            <TextField
                fullWidth
                label="Search"
                onInput={(event: any) => searchAndFilter(event)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="start">
                            <IconButton size="large">
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />


        </div>
    );
};
