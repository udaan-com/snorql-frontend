import React, {FunctionComponent, useRef, useState} from "react";
import {
  BaseInputDetails,
  BaseQueryCostAnalyserInputParam,
  BooleanInput,
  DateInput,
  DocSAnalysisResponse,
  EligibleQueryAnalysisInput,
  EligibleQueryForAnalysis,
  EnumInput,
  InputType,
  ListQueryCostAnalyserInputParam,
  NumberInput,
  PlanPointerType,
  QueryAnalyserInputDetails,
  QueryAnalyserInputType,
  SingleQueryCostAnalyserInputParam,
  StringInput,
  TimeStampInput
} from "../../../models";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";
import DoneIcon from "@material-ui/icons/Done";
import "html-query-plan/css/qp.css";
import {showPlan} from "html-query-plan/dist/index"; // For some reason not able to resolve in general!

interface QueryAnalysisInputViewProps {
  index: number;
  eligibleDbs: string[];
  input: EligibleQueryForAnalysis;
  onAnalysisTrigger: (index: number, req: QueryAnalyserInputDetails) => void;
  analysisResponse: {[key: number]:DocSAnalysisResponse};
}

export const QueryAnalysisInputView: FunctionComponent<QueryAnalysisInputViewProps> = (props) => {
  const {analysisResponse, index} = props;
  const {query, inputs} = props.input;

  const xmlContainerRef = useRef(null);

  const runAnalysis = (dbName: string, inputParams: BaseQueryCostAnalyserInputParam[]) => {
    const {input, onAnalysisTrigger, index} = props;
    const request = {
      query: input.query,
      inputDetails: inputParams,
      metadata: input.metadata,
      dbName
    } as QueryAnalyserInputDetails;
    onAnalysisTrigger(index, request);
  };

  const renderXmlPlan = () => {
    setTimeout(() => {
      const res = analysisResponse[index]!!;
      if (res
        && res.xmlPlanAnalysis
        && res.xmlPlanAnalysis.xmlPlan.length > 0
        && xmlContainerRef.current
      ) {
        showPlan(xmlContainerRef.current!!, res.xmlPlanAnalysis.xmlPlan);
      }
    }, 1000);
  };

  const getColorForType = (type: PlanPointerType): string => {
    if (type === PlanPointerType.MODERATE) {
      return 'orange';
    } else if (type === PlanPointerType.GOOD) {
      return 'green';
    } else {
      return 'red';
    }
  };

  const transformPointerText = (txt: string): string => {
    return txt.replace(/<\/b>/, '').replace(/<b>/, '')
  };

  return (
    <Box flex={1} paddingTop={5}>
      <Paper>
        <div style={{ paddingLeft: 15, paddingTop: 10 }}>
          <h2 style={{ marginTop: 5 }}>
            Query Details
          </h2>
          <h4>Identified Query</h4>
          <Typography style={{ marginBottom: 20 }} variant={'body1'}>
            {query}
          </Typography>
        </div>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div>
              <h3>Run Analysis on this Query!</h3>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <QueryInputProcessor
              inputs={inputs}
              eligibleDbs={props.eligibleDbs}
              onTrigger={runAnalysis}
            />
          </AccordionDetails>
        </Accordion>
        {analysisResponse && analysisResponse[index] ?
          <Accordion style={{ marginBottom: 20 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div>
                <h3>DocS Analysis Report</h3>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <>
                <h3>Execution Plan Analysis</h3>
                <h4>Executed Query</h4>
                <Typography style={{ marginBottom: 20 }} variant={'body1'}>
                  {analysisResponse[index].planAnalysis.executedQuery}
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Parameter</b></TableCell>
                      <TableCell><b>Value</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Query SubTree Cost</TableCell>
                      <TableCell>{analysisResponse[index].planAnalysis.estimateCost}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                {analysisResponse[index].planAnalysis.pointers.length > 0 ?
                  (<Box>
                    <h4>Some points to lookout for:</h4>
                    <ul>
                      {
                        analysisResponse[index].planAnalysis.pointers.map((it) => {
                          return (
                            <li style={{ color: getColorForType(it.type) }}>
                              {transformPointerText(it.text)}
                            </li>
                          );
                        })
                      }
                    </ul>
                  </Box>) : null
                }
                <Box
                  style={{ marginTop: 20 }}
                >
                  <h4>Query Graph Plan</h4>
                  <div ref={xmlContainerRef} />
                </Box>
                {renderXmlPlan()}
                </>
              </Box>
            </AccordionDetails>
          </Accordion> : null
        }
      </Paper>
    </Box>
  );
};

export const QueryInputProcessor = (
  {
    inputs,
    onTrigger,
    eligibleDbs
  }: {
    inputs: EligibleQueryAnalysisInput[];
    onTrigger: (dbName: string, inputs: BaseQueryCostAnalyserInputParam[]) => void;
    eligibleDbs: string[];
  }
) => {

    const [inputParams, setInputParams] = useState<BaseQueryCostAnalyserInputParam[]>([]);
    const [currentInputDialogIndex, setCurrentInputDialogIndex] = useState<number | undefined>(undefined);
    const [dbName, setDbName] = useState<string>(eligibleDbs[0]);
    const [preparedJsTexts, setPreparedJsTexts] = useState<{[key: string]: string}>({});

    const handleInputRowPress = (input: EligibleQueryAnalysisInput, index: number) => {
      setCurrentInputDialogIndex(index);
    };

  const renderInputDialog = (index: number, input: EligibleQueryAnalysisInput): JSX.Element => {
    return (
      <QueryInputDialog
        open={index === currentInputDialogIndex}
        handleClose={() => setCurrentInputDialogIndex(undefined)}
        helperTextMap={generateHelperText(input)}
        jsonText={prepareJsonInput(input)}
        verifyJson={verifyJson}
        processJson={(txt) => { processJson(input.parentKey, txt) }}
      />
    );
  };

  const processJson = (parentKey: string, txt: string) => {
    addPreparedJsText(parentKey, txt);
    let parsedJson = JSON.parse(txt);
    Object.keys(parsedJson).forEach(it => {
      const jsonValue = parsedJson[it];
      const inputDetails = inputs.find(it => it.parentKey == parentKey)?.details.find(d => d.key == it);
      if (inputDetails) {
        if (Array.isArray(jsonValue)) {
          const tempValue = jsonValue as any[];
          let isValidArray = true;
          tempValue.forEach(tv => isValidArray = verifyType(it, inputDetails.type, tv, inputDetails));
          if (isValidArray) {
            addInputValue(
              {
                key: it,
                type: inputDetails.type,
                value: jsonValue,
                inputType: QueryAnalyserInputType.LIST,
              } as ListQueryCostAnalyserInputParam
            )
            setCurrentInputDialogIndex(undefined);
          }
        } else {
          if (verifyType(it, inputDetails.type, jsonValue, inputDetails)) {
            addInputValue(
              {
                  key: it,
                  type: inputDetails.type,
                  value: jsonValue,
                  inputType: QueryAnalyserInputType.SINGLE,
              } as SingleQueryCostAnalyserInputParam
            )
            setCurrentInputDialogIndex(undefined);
          }
        }
      }
    });
  }

  const addInputValue = (input: BaseQueryCostAnalyserInputParam) => {
    const tempInputParams = inputParams.filter(it => it.key !== input.key);
    tempInputParams.push(input);
    setInputParams(tempInputParams);
  };

  const verifyType = (key: string, type: InputType, value: any, inputDetails: BaseInputDetails): boolean => {
    switch (type) {
      case InputType.STRING:
        if (typeof value !== "string") { alert(`Invalid Value: ${key} should be of type ${type}`); return false; }
        const strValue = value as string;
        if (strValue.trim().length === 0) { alert(`Invalid Value: ${key} cannot be empty`); return false; }
        else return true;
        break;
      case InputType.NUMBER:
        if (typeof value !== "number") { alert(`Invalid Value: ${key} should be of type ${type}`); return false; }
        else return true;
        break;
      case InputType.ENUM:
        const enumDetails = inputDetails as EnumInput;
        if (typeof value !== "string") { alert(`Invalid Value: ${key} should be of type ${type}`); return false }
        if (!enumDetails.superSet.find(e => e == value as string)) { alert(`Invalid Value: ${key} can only be ${enumDetails.superSet.join(", ")}`); return false; }
        const enStrValue = value as string;
        if (enStrValue.trim().length === 0) { alert(`Invalid Value: ${key} cannot be empty`); return false; }
        return true;
        break;
      case InputType.BOOLEAN:
        if (typeof value !== "boolean") { alert(`Invalid Value: ${key} should be of type ${type}`); return false }
        else return true;
        break;
      case InputType.DATE:
        if (typeof value !== "string") { alert(`Invalid Value: ${key} should be of type ${type}`); return false; }
        const dtStrValue = value as string;
        if (dtStrValue.trim().length === 0) { alert(`Invalid Value: ${key} cannot be empty`); return false; }
        else return true;
        break;
      case InputType.TIMESTAMP:
        if (typeof value !== "number") { alert(`Invalid Value: ${key} should be of type ${type}`); return false; }
        else return true;
        break;
    }
  };

  const verifyJson = (txt: string): boolean => {
    let isValidJson = true;
    try {
      JSON.parse(txt);
    } catch (e: any) {
      isValidJson = false;
    }
    return isValidJson;
  };

  const handleDbChange = (event: React.ChangeEvent<{value: unknown}>) => {
    const dbName = (event.target as HTMLSelectElement).value;
    setDbName(dbName);
  };

  const generateHelperText = (input: EligibleQueryAnalysisInput): {[key: string]: string} => {
    const map = {} as {[key: string]: string};
    input
      .details
      .forEach(it => {
        switch (it.type) {
          case InputType.NUMBER:
            const numIt = it as NumberInput;
            if (numIt.isNullable) {
              map[numIt.key] = "Following type is nullable, please use null in json to signify that"
            }
            break;
          case InputType.ENUM:
            const enumIt = it as EnumInput;
            let helperMessage = enumIt.superSet.join(", ");
            if (enumIt.isNullable) {
              helperMessage = `${helperMessage} :: Following type is nullable, please use null in json to signify that`;
            }
            map[enumIt.key] = helperMessage;
            break;
          case InputType.BOOLEAN:
            const boolIt = it as BooleanInput;
            if (boolIt.isNullable) {
              map[boolIt.key] = "Following type is nullable, please use null in json to signify that"
            }
            break;
          case InputType.DATE:
            const dateIt = it as DateInput;
            if (dateIt.isNullable) {
              map[dateIt.key] = "Following type is nullable, please use null in json to signify that"
            }
            break;
          case InputType.TIMESTAMP:
            const tsIt = it as TimeStampInput;
            if (tsIt.isNullable) {
              map[tsIt.key] = "Following type is nullable, please use null in json to signify that"
            }
            break;
          case InputType.STRING:
            const strIt = it as StringInput;
            if (strIt.isNullable) {
              map[strIt.key] = "Following type is nullable, please use null in json to signify that"
            }
        }

      });
    return map;
  }

  const prepareJsonInput = (params: EligibleQueryAnalysisInput): string => {
    if (preparedJsTexts[params.parentKey]) { return preparedJsTexts[params.parentKey]; }

    let finalParams;
    if (params.allowMultiple) {
      finalParams = params.details.slice(0, 1);
    } else {
      finalParams = params.details;
    }

    const obj = {} as {[key: string]: any};
    finalParams.forEach(it => {
      prepareJsonInputForParam(obj, it, params.allowMultiple);
    });

    return JSON.stringify(obj, undefined, 4);
  };

  const addPreparedJsText = (key: string, text: string) => {
    preparedJsTexts[key] = text;
    setPreparedJsTexts(
      preparedJsTexts
    );
  };

  const prepareJsonInputForParam = (obj: {[key:string]: any},  it: BaseInputDetails, allowMultiple: boolean) => {
    switch (it.type) {
      case InputType.NUMBER:
        const numIt = it as NumberInput;
        obj[numIt.key] = allowMultiple ? [0] : 0;
        break;
      case InputType.ENUM:
        const enumIt = it as EnumInput;
        obj[enumIt.key] = allowMultiple ? [enumIt.superSet[0]] : enumIt.superSet[0];
        break;
      case InputType.BOOLEAN:
        const boolIt = it as BooleanInput;
        obj[boolIt.key] = allowMultiple ? [true]: true;
        break;
      case InputType.DATE:
        const dateIt = it as DateInput;
        obj[dateIt.key] = allowMultiple ? ["20/12/1996"] : "20/12/1996";
        break;
      case InputType.TIMESTAMP:
        const tsIt = it as TimeStampInput;
        const currentEpoch = new Date().getMilliseconds();
        obj[tsIt.key] = allowMultiple ? [currentEpoch] : currentEpoch;
        break;
      case InputType.STRING:
        const strIt = it as StringInput;
        obj[strIt.key] = allowMultiple ? [""] : "";
    }
  };

  const allowAnalysis = () => {
    const allRequiredFields = inputs
      .filter(it => it.required)
      .flatMap(it => it.details);

    let allowAnalysis = true;
    allRequiredFields.forEach(it => {
      allowAnalysis = allowAnalysis && !!inputParams.find(ip => ip.key === it.key)
    });

    return allowAnalysis && dbName;
  };

  const allInputsProvidedForParentKey = (param: EligibleQueryAnalysisInput) => {
    let allInputsProvided = true;
    param
      .details
      .forEach(it => {
        allInputsProvided = allInputsProvided && !!inputParams.find(ip => ip.key === it.key)
      });
    return allInputsProvided;
  };

    return (
      <Box>
        <h3>Query Input Details</h3>
        <InputLabel style={{ marginBottom: 10 }} id="filter-label">Select DB (We'll use this DB to run the analysis)</InputLabel>
        <Select
          labelId="db-label"
          value={dbName}
          onChange={handleDbChange}
          label="Database Name"
          style={{ minWidth: 100, marginBottom: 15 }}
          variant={'outlined'}
        >
          {eligibleDbs.map(db => (
            <MenuItem key={db} value={db}>{db}</MenuItem>
          ))}
        </Select>
        {inputs.length > 0 &&
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><b>Sl No.</b></TableCell>
                        <TableCell><b>Parameter Key</b></TableCell>
                        <TableCell><b>Is Required</b></TableCell>
                        <TableCell><b>Allow Multiple</b></TableCell>
                        <TableCell><b>All Inputs Given</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {inputs.map((inputParam, index) => (
                      <TableRow
                        key={index}
                        onMouseEnter={(event) => onMouseOver(event)}
                        onMouseOut={event => onMouseOut(event)}
                        onClick={() => handleInputRowPress(inputParam, index)}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{inputParam.parentKey}</TableCell>
                        <TableCell>{inputParam.required ? "true" : "false"}</TableCell>
                        <TableCell>{inputParam.allowMultiple ? "true" : "false"}</TableCell>
                        <TableCell align={'center'}>{allInputsProvidedForParentKey(inputParam) ? (<DoneIcon />) : (<CloseIcon />)}</TableCell>
                      </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} align={'right'}>Click on the rows to add input values</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
          {inputs.map((inputParam, index) => (
              renderInputDialog(index, inputParam)
            ))}
        </TableContainer>
        }
        <Button
          disabled={!allowAnalysis()}
          style={{ marginTop: 15 }}
          variant={"contained"}
          color={'primary'}
          onClick={() => onTrigger(dbName, inputParams)}>
          Analyse Query
        </Button>
      </Box>
    );
};

interface QueryInputDialogProps {
  open: boolean;
  handleClose: () => void;
  helperTextMap: {[key: string]: string};
  jsonText: string;
  verifyJson: (txt: string) => boolean;
  processJson: (txt: string) => void;
}

export const QueryInputDialog: React.FunctionComponent<QueryInputDialogProps> = (props: QueryInputDialogProps) => {
  const { open, handleClose, helperTextMap, jsonText, processJson, verifyJson } = props

  return (
    <Dialog open={open} onClose={handleClose}>
      <QueryInputForm
        helperTextMap={helperTextMap}
        jsonText={jsonText}
        processJson={processJson}
        verifyJson={verifyJson}
      />
    </Dialog>
  );
};


interface QueryInputProps {
  helperTextMap: {[key: string]: string};
  jsonText: string;
  verifyJson: (txt: string) => boolean;
  processJson: (txt: string) => void;
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),

    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '300px',
    },
    '& .MuiButtonBase-root': {
      margin: theme.spacing(2),
    },
  },
}));

export const QueryInputForm: React.FunctionComponent<QueryInputProps> = (props: QueryInputProps) => {
  const { jsonText, helperTextMap, verifyJson, processJson } = props;

  const [jsText, setJsText] = useState<string>(jsonText);


  const handleSubmit = (e:any) => {
    e.preventDefault();
    if (verifyJson(jsText)){
      processJson(jsText);
    } else {
      alert("Not a valid JSON, please verify JSON and try again!")
    }
  };

  return (
    <Box padding={2}>
      <h3>Input Values</h3>
      {Object.keys(helperTextMap).length > 0 && <TableContainer component={Paper}>
          <Table aria-label="simple table">
              <TableHead>
                  <TableRow>
                      <TableCell>Key</TableCell>
                      <TableCell>Helper Text</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(helperTextMap).map((rowKey) => (
                  <TableRow key={rowKey}>
                    <TableCell scope="row">
                      {rowKey}
                    </TableCell>
                    <TableCell>{helperTextMap[rowKey]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </Table>
      </TableContainer>
      }
      <h5>Please provide the input values for the query</h5>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Query Input Values"
          multiline
          style={{ width: 500 }}
          rows={10}
          value={jsText}
          onChange={(e) => setJsText(e.target.value)}
          variant="outlined"
        />
        <div style={{ marginTop: 15 }}>
          <Button type="submit" variant="contained" color="primary">
            Save Inputs
          </Button>
        </div>
      </form>
    </Box>

  );
};



const onMouseOver = (event:any) => {
  event.target.style.cursor = "pointer"
  event.target.style.background = "#D3D3D3"
}

const onMouseOut = (event:any) => {
  event.target.style.background = "#FFFFFF"
}
