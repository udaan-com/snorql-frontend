import React, {FunctionComponent, useCallback, useEffect, useRef, useState} from "react";
import {Box, Button, CircularProgress, makeStyles, TextField, Typography} from "@material-ui/core";
import {
  AnalysisAgent,
  DocSAnalysisResponse,
  EligibleQueryAnalysisResponse,
  GithubAnalysisRequest,
  QueryAnalyserInputDetails
} from "../../../models";
import {DocSService} from "../../../services/DocSService";
import {QueryAnalysisInputView} from "../common/QueryAnalysisInputView";
import {useParams} from "react-router";


export const GithubQueryAnalyser: FunctionComponent = () => {
  const {githubPrUrl} = useParams<{githubPrUrl: string}>();
  const [prUrl, setPrUrl] = useState<string>(githubPrUrl);
  const [eligibleQueriesResponse, setEligibleQueriesResponse] = useState<EligibleQueryAnalysisResponse>();
  const [eligibleDbs, setEligibleDbs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [analysisResponse, setAnalysisResponse] = useState<{[key: number]:DocSAnalysisResponse}>({});

  const [, updateState] = useState<number>();

  const handleSubmit = (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    const payload: GithubAnalysisRequest = {
      prUrl,
      type: AnalysisAgent.GITHUB
    } as GithubAnalysisRequest

    DocSService.handleAnalysisRequest(payload)
      .then((r) => {
        setIsLoading(false);
        setEligibleQueriesResponse(r);
      })
      .catch(e => {
        setIsLoading(false);
        alert(e.message)
      });
  };

  const onAnalysisTrigger = (index: number, req: QueryAnalyserInputDetails)=> {
    DocSService.runQueryAnalysis(req)
      .then(r => {
        analysisResponse[index] = r;
        setAnalysisResponse(analysisResponse);
        updateState(0);
      })
      .catch(e => {
        alert(e.message);
        setAnalysisResponse(analysisResponse);
      });
  };

  useEffect(() => {
    DocSService.getAllEligibleDatabases()
      .then((r) => {
        setEligibleDbs(r.dbs);
      })
      .catch(e => alert(e.message))
  }, []);

  return (
    <Box paddingTop={10} paddingLeft={4} style={{ minWidth: window.innerWidth - 600 }}>
        <form onSubmit={handleSubmit}>
          <Typography style={{ marginBottom: 5 }} variant={'h5'}>Please provide your Github PR URL</Typography>
          <TextField
            type="string"
            label="PR Url"
            variant="outlined"
            fullWidth={true}
            required
            value={prUrl}
            onChange={e => setPrUrl(e.target.value)}
          />
          <div style={{ marginTop: 10 }}>
            <Button type="submit" variant="contained" color="primary">
              Fetch Eligible Queries
            </Button>
          </div>
        </form>
        {eligibleQueriesResponse &&
        <Box>
          {eligibleQueriesResponse.eligibleQueries.length > 0 ? (
            eligibleQueriesResponse
              .eligibleQueries
              .map((it, index) =>
                <QueryAnalysisInputView
                  index={index}
                  input={it}
                  onAnalysisTrigger={onAnalysisTrigger}
                  eligibleDbs={eligibleDbs}
                  analysisResponse={analysisResponse}
                />
              )
          ) : (
              <Box>
                <Typography variant={'h6'}>No Records found!</Typography>
              </Box>
            )
          }
          </Box>
        }
        {isLoading ? <CircularProgress style={{ marginTop: 20 }} /> : null}
    </Box>
  );
};
