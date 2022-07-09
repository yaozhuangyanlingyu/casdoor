// Copyright 2021 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import * as Setting from "./Setting";
import { Select } from "antd";

const { Option } = Select;

class SelectRegionBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            classes: props,
            value: "",
        };
    }

    onChange(e) {
        this.props.onChange(e);
        this.setState({value: e})
    };

    render() {
        return (
          <Select virtual={false}
                  showSearch
                  optionFilterProp="label"
                  style={{width: '100%'}}
                  defaultValue={this.props.defaultValue || undefined}
                  placeholder="Please select country/region"
                  onChange={(value => {this.onChange(value);})}
                  filterOption={(input, option) =>
                      option.label.indexOf(input) >= 0
                  }
          >
            {
                Setting.CountryRegionData.map((item, index) => (
                    <Option key={index} value={item.code} label={item.code} >
                        <img src={`${Setting.StaticBaseUrl}/flag-icons/${item.code}.svg`} alt={item.name} height={20} style={{marginRight: 10}}/>
                        {`${item.name} (${item.code})`}
                    </Option>
                ))
            }
          </Select>
        )
    };
}

export default SelectRegionBox;
