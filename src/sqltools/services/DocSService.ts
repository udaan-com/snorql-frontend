import {APIClient} from "../../common/fetch";
import {INFRA_PROBS_BASE_PATH} from "../constants";
import {
  BaseAnalysisRequest,
  DocSAnalysisResponse,
  DocSEligibleDatabases,
  EligibleQueryAnalysisResponse,
  QueryAnalyserInputDetails
} from "../models";

const { fetch } = new APIClient(`/api${INFRA_PROBS_BASE_PATH}`);

export class DocSService {

  static getAllEligibleDatabases(): Promise<DocSEligibleDatabases> {
    return fetch(
      `/sql/docs/eligible-databases`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then(r => {
      if (r.status !== 200) {
        return r.text().then(t => {
          throw new Error(`HTTP ${r.status}: ${t}`);
        })
      }
      return r;
    }).then(r => r.json());
  }

  static handleAnalysisRequest(request: BaseAnalysisRequest): Promise<EligibleQueryAnalysisResponse> {
    return fetch(
      `/sql/docs/analysis-request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }
    ).then(r => {
      if (r.status !== 200) {
        return r.text().then(t => {
          throw new Error(`HTTP ${r.status}: ${t}`);
        })
      }
      return r;
    }).then(r => r.json())
  }

  static runQueryAnalysis(request: QueryAnalyserInputDetails): Promise<DocSAnalysisResponse> {
    return fetch(
      `/sql/docs/analyse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }
    ).then(r => {
        if (r.status !== 200) {
          return r.text().then(t => {
            throw new Error(`HTTP ${r.status}: ${t}`);
          })
        }
        return r;
      }).then(r => r.json());
  }
}
