export class Helpers {
    static changeSize(result: any) {
        let convertedResult: any[] = Array();

        result.map((x: any) => {
            let convertedObj: { [key: string]: string } = {};
            Object.entries(x).map((x: any, y: any) => {
                if (x[1] && typeof x[1] != "number") {
                    let splitString = x[1].split(" ");
                    if (splitString[0] != undefined && splitString[0] != x[1]) {
                        let converted = Helpers.convertSize(
                            splitString[1].toUpperCase(),
                            "GB",
                            parseFloat(splitString[0])
                        );
                        if (converted != undefined) {
                            x[1] = converted + "GB";
                        }
                    }
                }
                convertedObj[x[0]] = x[1];
            });
            convertedResult.push(convertedObj);
        });
        return convertedResult;
    }

    static convertSize(currentSize: string, wantedSize: string, value: number) {
        return Helpers.convertUnit(value, currentSize, wantedSize)
    }

    static convertUnit(value: number, source: string, target: string) {
        const conversionCoefficients: {[unit: string]: number} = {
            "bytes": 1,
            "KB": 1024,
            "MB": 1024 * 1024,
            "GB": 1024 * 1024 * 1024
        };
        const valueBytes = value * conversionCoefficients[source];
        return valueBytes / conversionCoefficients[target];
    }

    static roundSize = (values: number | null | undefined): Number => {
        if (values) {
            return Math.round(values);
        } else {
            return 0;
        }
    };
}