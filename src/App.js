import React from 'react';
//Import Office UI Fabric React modules
import {DefaultButton} from 'office-ui-fabric-react/lib/Button';
import XLSX from 'xlsx';


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: "http://blckchn.de/sample.xlsx",
            Label: [],
            data: [],
        };
        this.handleFile = this.handleFile.bind(this);
    };


    async componentDidMount(){
        await this.OnParse()
    }

    handleFile(file/*:File*/) {
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;
        reader.onload = (e) => {
            /* Parse data */
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, {type: rABS ? 'binary' : 'array'});
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_json(ws, {header: 1});
            /* Update state */
            this.FilterData(data);
        };
        if (rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
    };

    OnParse = async () => {
        let res = await fetch("https://cors-anywhere.herokuapp.com/" + this.state.url, {
            mode: 'cors',
            method: 'GET',
        });
        res.blob().then(blob => this.handleFile(blob));
    };

    FilterData = (data) => {
        let arr = [];
        let indexLabel = null;
        data[0].map((value, index) => {
            if (value === "Label") {
                indexLabel = index
            }
        });
        data = data.map((value, index) => {
            if (index > 1) {
                value.map((v, index) => {
                    if (index === indexLabel) {
                        arr.push(v)
                    }
                })
            }
            value.splice(indexLabel, 1);
            return value
        });
        this.setState({Label: arr,data})
    };


    render() {
        return (
            <div>
                <div>
                    <div>
                        {this.state.Label.length === 0?(<p>Label not fount</p>):this.state.Label.map((value, index) => {
                            return (
                                <span key={index}>
                                    <DefaultButton text={value} style={{margin: 5}}/>{(index + 1) % 3 === 0 ? <br/> : null}
                                </span>

                            )
                        })}
                    </div>
                    <div>
                        <table className="table table-striped">
                            <thead>
                            </thead>
                            <tbody>
                            {this.state.data.map((value, i) => <tr key={i}>
                                {value.map((v, index) => <td key={index}>{v}</td>)}
                            </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
};


export default App;
