import mixpanel from 'mixpanel-browser';
import {mixpanelToken, env_check} from "./MixpanelConfigKeys";

mixpanel.init(mixpanelToken);

let actions = {
    identify: (id : string) => {
        if(env_check) mixpanel.identify(id);

    },
    alias: (id : string) => {
        if(env_check) mixpanel.alias(id);
    },
    track: (name : string, props :any) => {
        if(env_check) mixpanel.track(name, props);
    },
    people: {
        set: (props :any) => {
            if(env_check) mixpanel.people.set(props);
        },
    },
    time_event: (name:string) => {
        if(env_check) mixpanel.time_event(name);
    }
};

export const SqlMixpanelConfig = actions;
