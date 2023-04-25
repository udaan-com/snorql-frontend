import uPlot, {Plugin } from "uplot";
class CustomZoomHooks {
    init = (u: uPlot) => {
        let setZoomSelector = document.getElementById("set-zoom-render-chart")
        
        setZoomSelector?.addEventListener("click", () => {
            let fromDateSelector = (<HTMLInputElement>document.getElementById("from-date-render-chart")).value;
            let toDateSelector = (<HTMLInputElement>document.getElementById("to-date-render-chart")).value;

            let fromDate  =new Date(fromDateSelector)
            let toDate  =new Date(toDateSelector)

            u.setScale("x", {
                min: fromDate.getTime()/1000,
                max: toDate.getTime()/1000
            });
        
        });
    };

}

export function customZoomPlugin (): Plugin {
    return {
        hooks: new CustomZoomHooks(),
    };
}
