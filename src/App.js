import React from 'react';
//Import Office UI Fabric React modules
import {DefaultButton} from 'office-ui-fabric-react/lib/Button';
import XLSX from 'xlsx';
import {Dropdown, IDropdown, DropdownMenuItemType, IDropdownOption} from 'office-ui-fabric-react/lib/Dropdown';


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: "http://blckchn.de/sample.xlsx",
            Label: [],
            data: [],
            selectedItems: []
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
        let indexID = null;
        data[0].map((value, index) => {
            if (value === "Label") indexLabel = index;
            else if (value === "ID") indexID = index
        });
        data = data.map((value, index) => {
            if (index > 1) {
                let count = {}
                value.map((v, index) => {
                    if (index === indexLabel) {
                        count = {
                            ...count,
                            Label: v
                        }
                    }
                    if (index === indexID) {
                        count = {
                            ...count,
                            text: v,
                            key: arr.length
                        }

                    }
                    if (value.length === index + 1 && count.Label) arr.push(count)
                })
            }
            value.splice(indexLabel, 1);
            return value
        });
        this.setState({Label: arr, data})
    };

    onChangeMultiSelect = (event, item) => {
        const updatedSelectedItem = this.state.selectedItems ? this.copyArray(this.state.selectedItems) : [];
        if (item.selected) {
            // add the option if it's checked
            updatedSelectedItem.push(item.key);
        } else {
            // remove the option if it's unchecked
            const currIndex = updatedSelectedItem.indexOf(item.key);
            if (currIndex > -1) {
                updatedSelectedItem.splice(currIndex, 1);
            }
        }
        this.setState({
            selectedItems: updatedSelectedItem
        });
    };

    copyArray = (array) => {
        const newArray = [];
        for (let i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }
        return newArray;
    };

    filter(value) {
        let filter = false;
        this.state.selectedItems && this.state.selectedItems.map(v => {
            if (v === value.key) {
                filter = true;
            }
        })
        return filter
    }

    Button() {
        return this.state.Label.map((value, index) => {
            return (
                <span
                    style={this.state.selectedItems.length !== 0 ? {display: this.filter(value) ? null : 'none'} : null}
                    key={index}>
                                    <DefaultButton text={value.Label} style={{margin: 5}}/>{(index + 1) % 3 === 0 ?
                    <br/> : null}
                                </span>
            )
        })
    }

    render() {
        return (
            <div>
                <Dropdown
                    placeHolder="Select options"
                    selectedKeys={this.state.selectedItems}
                    onChange={this.onChangeMultiSelect}
                    multiSelect
                    options={this.state.Label}
                />
                <div>
                    {this.Button()}
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
