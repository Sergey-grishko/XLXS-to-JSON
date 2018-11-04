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
            arrSelect: [],
            data: []
            // selectedItems: [2, 7, 1]
        };
        this.handleFile = this.handleFile.bind(this);
    };


    async componentDidMount() {
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
            this.SelectData(data);
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
            if (value === "Label") indexLabel = index;
        });
        data.map((value, index) => {
            if (index > 1) {
                let count = {}
                value.map((v, index) => {
                    if (index === indexLabel) {
                        count = {
                            ...count,
                            Label: v
                        }
                    }
                    if (value.length === index + 1 && count.Label) arr.push(count)
                })
            }
        });
        this.setState({Label: arr, data})
    };

    SelectData = (data) => {
        let arr = [];
        data.map((value, index) => {
            if (index > 1 && value.length > 1) {
                arr.push(value)
            }
        })
        this.setState({arrSelect: arr})
    }

    Label(id) {
        let test = this.state.arrSelect[id - 1]
        if (this.state.arrSelect.length !== 0) {
            return test[1]
        }
    }

    Description(id) {
        let test = this.state.arrSelect[id - 1]
        if (this.state.arrSelect.length !== 0) {
            return test[2]
        }
    }

    render() {
        return (
            <div>
                <div style={{marginBottom: 20, display: "flex",}}>
                    <div style={{margin: 5, background: "blue", padding: 10}}>
                        <p>Speical Offer: {this.Label(3)}</p>
                        <p>{this.Description(3)}</p>
                    </div>
                    <div style={{margin: 5, background: "blue", padding: 10}}>
                        <p>Speical Offer: {this.Label(8)}</p>
                        <p>{this.Description(8)}</p>
                    </div>
                    <div style={{margin: 5, background: "blue", padding: 10}}>
                        <p>Speical Offer: {this.Label(1)}</p>
                        <p>{this.Description(1)}</p>
                    </div>
                </div>
                <div>
                    {this.state.Label.map((value, index) => {
                        return (
                            <span key={index}>
                <DefaultButton text={value.Label} style={{margin: 5}}/>{(index + 1) % 3 === 0 ?
                                <br/> : null}
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
        );
    };
};


export default App;
