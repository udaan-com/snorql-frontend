import React, {FunctionComponent} from "react";
import {Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography} from "@mui/material";
import {useHistory} from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const DocSAnalyserScreen: FunctionComponent = () => {
  const history = useHistory();
  return (
    <Box paddingTop={5}>
      <Typography style={{ marginBottom: 10 }} variant={'h4'}>DocS Query Analyser</Typography>
      <Typography style={{ marginBottom: 10 }} variant={'h6'}>Select your analysis agent to continue further</Typography>
      <Box>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div>
              <h4>GITHUB (Query Analysis using PR)</h4>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Box>
                <Typography variant={'body1'}>This kind of analysis requires the Github PR URL which has already been linted and query changes have been sniffed</Typography>
              </Box>
              <Button style={{ marginTop: 10 }} color={'primary'} variant={"contained"} onClick={() => history.push('/docs-analyser/github-analyser')}>
                Analyse Query
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div>
              <h4>ADHOC (Manual Query Analysis)</h4>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Box>
                <Typography variant={'body1'}>This kind of analysis requires the SQL Query (Raw or Parameterised)</Typography>
              </Box>
              <Button style={{ marginTop: 10 }} color={'primary'} variant={"contained"} onClick={() => history.push('/docs-analyser/adhoc-analyser')}>
                Analyse Query
              </Button>
            </Box>
          </AccordionDetails>

        </Accordion>
      </Box>
    </Box>
  );
};
