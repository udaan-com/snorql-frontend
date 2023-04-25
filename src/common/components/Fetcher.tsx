import React from 'react';
import ProgressView from "./ProgressView";
import ErrorView from "./ErrorView";

export interface FetcherProps<R> {
    fetchData?: () => Promise<R>;
    onFetch?: (r: R) => void;
    onFetchError?: (e: Error) => void;
    children: (false | string | JSX.Element | JSX.Element[] | any )
}

export interface State {
    loading: boolean;
    error?: Error;
}

export class Fetcher<R> extends React.Component<FetcherProps<R>> {

    readonly state: Readonly<State> = {
        loading: true,
    };

    private fetchData = () => {
        const {fetchData, onFetch, onFetchError} = this.props;
        if (fetchData) {
            this.setState({loading: true, error: undefined});
            fetchData().then(r => {
                this.setState({loading: false});
                if (onFetch) {
                    onFetch(r);
                }
            }).catch(e => {
                console.log(e)
                this.setState({loading: false, error: e});
                if (onFetchError) {
                    onFetchError(e);
                }
            })
        } else {
            this.setState({loading: false, error: undefined});
        }
    };

    reload () {
        this.fetchData();
    }

    componentDidMount () {
        this.fetchData();
    }

    render () {
        const {loading, error} = this.state;
        if (loading) {
            return <ProgressView />;
        } else if (error) {
            return <ErrorView error={error} onRetry={this.fetchData} />;
        } else {
            return <>{this.props.children}</>;
        }
    };

}
