import React from 'react';
//Import Office UI Fabric React modules
import {DefaultButton} from 'office-ui-fabric-react/lib/Button';
import {TextField} from 'office-ui-fabric-react/lib/TextField';
import {
    DetailsList,
    DetailsListLayoutMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import {Modal} from 'office-ui-fabric-react/lib/Modal';
import {Icon} from 'office-ui-fabric-react/lib/Icon';
import XLSX from 'xlsx';

//setting
const startRow = 1;
const RenderColumn = [1, 2, 3, 4];
const url = "http://blckchn.de/sample.xlsx";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Label: [],
            arrSelect: [],
            data: [],
            DefaultData: [],
            Header: [],
            showModal: false,
            description: ''
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
        let res = await fetch("https://cors-anywhere.herokuapp.com/" + url, {
            mode: 'cors',
            method: 'GET',
        });
        res.blob().then(blob => this.handleFile(blob));
    };

    FilterData = (data) => {
        let arr = [];
        let NewArr = [];
        let indexLabel = null;
        data[0].forEach((value, index) => {
            if (value === "Label") indexLabel = index;
        });
        data.forEach((value, index) => {
            if (index > 1) {
                let count = {};
                value.forEach((v, index) => {
                    if (index === indexLabel) {
                        count = {
                            ...count,
                            Label: v
                        }
                    }
                    if (value.length === index + 1 && count.Label) arr.push(count)
                })
            }
            if (index > startRow) {
                if (typeof value[0] === "number") {
                    NewArr = [...NewArr, {
                        key: index,
                        ID: value[0],
                        Label: value[1],
                        Description: value[2],
                        Link: value[3],
                        Icon: value[4]
                    }]
                }
            }
        });
        this.setState({Label: arr, data: NewArr, DefaultData: NewArr, Header: data[0]})
    };

    SelectData = (data) => {
        let arr = [];
        data.forEach((value, index) => {
            if (index > 1 && value.length > 1) {
                arr.push(value)
            }
        });
        this.setState({arrSelect: arr})
    };

    Table = (data) => {
        let NewArr = []
        data.forEach((value, index) => {
            NewArr = [...NewArr, {
                key: index,
                ID: <div dangerouslySetInnerHTML={{__html: value.ID}}/>,
                Label: <div dangerouslySetInnerHTML={{__html: value.Label}}/>,
                Description: <div dangerouslySetInnerHTML={{__html: value.Description}}/>,
                Link: <div dangerouslySetInnerHTML={{__html: value.Link}}/>,
                Icon: <div dangerouslySetInnerHTML={{__html: value.Icon}}/>
            }]
        })
        return NewArr
    }

    Label(id) {
        let test = this.state.arrSelect[id - 1];
        if (this.state.arrSelect.length !== 0) {
            return test[1]
        }
    }

    Description(id) {
        let test = this.state.arrSelect[id - 1];
        if (this.state.arrSelect.length !== 0) {
            return test[2]
        }
    }


    _onChange = (ev, text) => {
        let res = this.state.DefaultData.filter(value => {
            console.log(value)
            let Lable = value.Label.toLowerCase().indexOf(text.toLowerCase()) !== -1;
            let Description = value.Description.toLowerCase().indexOf(text.toLowerCase()) !== -1;
            let Link = value.Link && value.Link.toLowerCase().indexOf(text.toLowerCase()) !== -1;
            if (Lable || Description || Link) {
                return true
            }
        });
        this.setState({data: text.length === 0 ? this.state.DefaultData : res})
    };

    _columns = () => {
        let arr = [];
        this.state.Header.forEach((value, index) => {
            if (RenderColumn.indexOf(index) !== -1) {
                arr = [...arr, {
                    key: 'column' + index,
                    name: value,
                    fieldName: value,
                    minWidth: 100,
                    maxWidth: 200,
                    isResizable: true,
                    ariaLabel: 'Operations for name'
                }]
            }
        });
        return arr;
    };

    modalOpen = (e = null) => {
        if (e) {
            this.setState({description: e.Description})
        }
        this.setState({showModal: !this.state.showModal})
    };

    render() {
        return (
            <div style={{padding: "0 20px 0 20px"}}>
                <Modal
                    titleAriaId="titleId"
                    isOpen={this.state.showModal}
                    onDismiss={() => this.modalOpen()}
                    isBlocking={false}
                    containerClassName="ms-modalExample-container"
                >
                    <div id="titleId" className="ms-modalExample-body">
                        <DefaultButton onClick={() => this.modalOpen()} text="Close"/>
                    </div>
                    <div style={{padding: 40}}>
                        {this.state.description}
                    </div>
                </Modal>
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
                                <DefaultButton text={value.Label} style={{margin: 5}}/>{(index + 1) % 3 === 0 &&
                            <br/>}
                            </span>
                        )
                    })}
                </div>
                <TextField label="Filter:" onChange={this._onChange}/>
                {this.state.data.length !== 0 && (
                    <DetailsList
                        componentRef={this._detailsList}
                        items={this.Table(this.state.data)}
                        columns={this._columns()}
                        setKey="set"
                        layoutMode={DetailsListLayoutMode.fixedColumns}
                        onActiveItemChanged={(e) => this.modalOpen(e)}
                    />
                )}
            </div>
        );
    }
    ;
};


export default App;
