import React, {useState} from 'react';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import IconButton from '@mui/material/IconButton';
import { Tooltip } from '@mui/material';

interface Props {
    text: string;
}

export const CopyToClipboard: React.FunctionComponent<Props> = (props: Props) => {
    const { text } = props;
    const [copySuccess, setCopySuccess] = useState('');

    const copyToClipBoard = async (copyMe: string) => {
        try {
            await navigator.clipboard.writeText(copyMe);
            setCopySuccess('Copied!');
        } catch (err) {
            setCopySuccess('Failed to copy!');
        }
    };
    return <>
    {copySuccess}
      <Tooltip title="Copy to clipboard">
        <IconButton onClick={() => copyToClipBoard(text)} size="large">
          <FileCopyIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
    </>;
};
