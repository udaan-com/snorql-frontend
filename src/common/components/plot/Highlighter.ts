import uPlot, { Plugin, Scale, Series } from "uplot";
import { UPlotProps } from "./Plot";
import { convertNumberToUnit, MetricUnit, toFixed } from "../../utils";

interface HighlighterOptions {
    props?: UPlotProps
}


class HighlighterHook {

    private readonly options: HighlighterOptions;

    constructor(options: HighlighterOptions) {
        this.options = options;
    }
    hexToRgbA = function (hex: string, a: number) {
        hex = hex.replace('#', '');

        if (hex.length == 3)
            hex = hex.split('').map(c => c.repeat(2)).join('');

        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }

    drawGraph = function (u: uPlot, h: HighlighterHook) {
        let { ctx } = u;
        let { left, top, width, height } = u.bbox;
        let { scale } = u.series[0];
        const desiredX1 = h.options.props?.highlightX1;
        const desiredX2 = h.options.props?.highlightX2;
        
        let cx = Math.round(u.valToPos(desiredX1!, 'x', true));    
        let cx1 = Math.round(u.valToPos(desiredX2!, 'x', true));

        const length = cx1 - cx;

        ctx.save();
        ctx.strokeStyle = h.hexToRgbA('#FDA187', 0.2);
        ctx.lineWidth = length;
        ctx.beginPath();
        ctx.rect(cx, top, cx1 - cx, height);
        ctx.clip();
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    init = (u: uPlot) => {
        if ( (this.options.props?.highlightX1 && this.options.props.highlightX2) && !(this.options.props?.highlightX1 == -1 && this.options.props.highlightX2 == -1))
        {
            setTimeout(this.drawGraph, 500, u, this);        
        }
    };

}

export function highLighterPlugin(options: HighlighterOptions): Plugin {
    return {
        hooks: new HighlighterHook(options),
    };
}
