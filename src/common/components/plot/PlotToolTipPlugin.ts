import uPlot, {Plugin, Series} from "uplot";
import {convertNumberToUnit, MetricUnit, toFixed} from "../../utils";

interface PlotToolTipPluginOptions {
    yType: MetricUnit;
}


class PlotToolTipHooks {

    private readonly options: PlotToolTipPluginOptions;
    private readonly tt: HTMLDivElement;

    constructor (options: PlotToolTipPluginOptions) {
        this.options = options;
        this.tt = document.createElement("div");
        this.tt.className = "tooltip";
        this.tt.textContent = `Tooltip`;
        this.tt.style.pointerEvents = "none";
        this.tt.style.position = "absolute";
        this.tt.style.background = "rgba(0,0,0,0.7)";
        this.tt.style.color = 'white';
        this.tt.style.display = "block";
        this.tt.style.padding = '4px';
        this.tt.style.maxHeight = '200px';
        this.tt.style.overflow = 'hidden';
    }

    private hideTips() {
        this.tt.style.display = "none";
    }

    private showTips() {
        this.tt.style.display = "block";
    }

    init = (u: uPlot) => {
        let plotElem = u.root.querySelector(".u-over")!;
        plotElem.appendChild(this.tt);
        plotElem.addEventListener("mouseleave", () => {
            if (!u.cursor.lock) {
                this.hideTips();
            }
        });
        plotElem.addEventListener("mouseenter", () => {
            this.showTips();
        });
        this.hideTips();
    };

    setCursor = (u: uPlot) => {
        const {left, top, idx} = u.cursor;
        if (!left || !top || !idx) {
            return;
        }
        this.tt.style.left = (left + 15) + "px";
        this.tt.style.top = (top + 15) + "px";
        const units = u.series
            .map((s, i): [number | null, string] => {
                if (i === 0) return [Infinity, `<div>${getTime(u.data[0][idx])}</div>`];
                // @ts-ignore
                const y: number | null = u.data[i][idx];
                const div: string = y !== null ? `<div>${s.label}: ${convertNumberToUnit(y, this.options.yType)}</div>` : "";
                return [y, div];
            })
            .sort((a, b) => {
                if (a[0] !== null && b[0] !== null) {
                    return a[0] > b[0] ? -1 : 1;
                } else if (a[0] !== null) {
                    return a[0];
                } else if (b[0] !== null) {
                    return b[0];
                } else {
                    return 0;
                }
            })
        this.tt.innerHTML = units.map(it => it[1]).join('\n');
    };

}

function getTime (ts: number): string {
    return new Date(ts*1000).toLocaleTimeString();
}

export function tooltipsPlugin (options: PlotToolTipPluginOptions): Plugin {
    return {
        hooks: new PlotToolTipHooks(options),
    };
}
