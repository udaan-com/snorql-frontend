import React, {useState} from 'react';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import IconButton from '@material-ui/core/IconButton';
import { Tooltip } from '@material-ui/core';

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
    return (
        <>
        {copySuccess}
          <Tooltip title="Copy to clipboard">
            <IconButton onClick={() => copyToClipBoard(text)}>
              <FileCopyIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        </>
    );
};
