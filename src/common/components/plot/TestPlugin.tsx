import uPlot, { Plugin, Scale, Series } from "uplot";
import { UPlotProps } from "./Plot";
import { convertNumberToUnit, MetricUnit, toFixed } from "../../utils";

interface TestPluginOptions {
    props?: UPlotProps
}


class TestPluginHook {

    private readonly options: TestPluginOptions;

    constructor(options: TestPluginOptions) {
        this.options = options;
    }
    setSelect = (u: uPlot) => {
        let min = u.posToVal(u.select.left, 'x');
        let max = u.posToVal(u.select.left + u.select.width, 'x');

        console.log("Fetching data ...", {min, max});
    }

}

export function testPlugin(options: TestPluginOptions): Plugin {
    return {
        hooks: new TestPluginHook(options),
    };
}
