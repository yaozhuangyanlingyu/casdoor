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
import {Link} from "react-router-dom";
import {Button, Popconfirm, Switch, Table} from 'antd';
import moment from "moment";
import * as Setting from "./Setting";
import * as OrganizationBackend from "./backend/OrganizationBackend";
import i18next from "i18next";
import BaseListPage from "./BaseListPage";

class OrganizationListPage extends BaseListPage {
  newOrganization() {
    const randomName = Setting.getRandomName();
    return {
      owner: "admin", // this.props.account.organizationname,
      name: `organization_${randomName}`,
      createdTime: moment().format(),
      displayName: `New Organization - ${randomName}`,
      websiteUrl: "https://door.casdoor.com",
      favicon: "https://cdn.casdoor.com/static/favicon.png",
      passwordType: "plain",
      PasswordSalt: "",
      phonePrefix: "86",
      defaultAvatar: "https://casbin.org/img/casbin.svg",
      tags: [],
      masterPassword: "",
      enableSoftDeletion: false,
      isProfilePublic: true,
      accountItems: [
        {name: "Organization", visible: true, viewRule: "Public", modifyRule: "Admin"},
        {name: "ID", visible: true, viewRule: "Public", modifyRule: "Immutable"},
        {name: "Name", visible: true, viewRule: "Public", modifyRule: "Admin"},
        {name: "Display name", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "Avatar", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "User type", visible: true, viewRule: "Public", modifyRule: "Admin"},
        {name: "Password", visible: true, viewRule: "Self", modifyRule: "Self"},
        {name: "Email", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "Phone", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "Country/Region", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "Location", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "Affiliation", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "Title", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "Homepage", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "Bio", visible: true, viewRule: "Public", modifyRule: "Self"},
        {name: "Tag", visible: true, viewRule: "Public", modifyRule: "Admin"},
        {name: "Signup application", visible: true, viewRule: "Public", modifyRule: "Admin"},
        {name: "3rd-party logins", visible: true, viewRule: "Self", modifyRule: "Self"},
        {name: "Properties", visible: false, viewRule: "Admin", modifyRule: "Admin"},
        {name: "Is admin", visible: true, viewRule: "Admin", modifyRule: "Admin"},
        {name: "Is global admin", visible: true, viewRule: "Admin", modifyRule: "Admin"},
        {name: "Is forbidden", visible: true, viewRule: "Admin", modifyRule: "Admin"},
        {name: "Is deleted", visible: true, viewRule: "Admin", modifyRule: "Admin"},
      ],
    }
  }

  addOrganization() {
    const newOrganization = this.newOrganization();
    OrganizationBackend.addOrganization(newOrganization)
      .then((res) => {
          this.props.history.push({pathname: `/organizations/${newOrganization.name}`, mode: "add"});
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Organization failed to add: ${error}`);
      });
  }

  deleteOrganization(i) {
    OrganizationBackend.deleteOrganization(this.state.data[i])
      .then((res) => {
          Setting.showMessage("success", `Organization deleted successfully`);
          this.setState({
            data: Setting.deleteRow(this.state.data, i),
            pagination: {total: this.state.pagination.total - 1},
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Organization failed to delete: ${error}`);
      });
  }

  renderTable(organizations) {
    const columns = [
      {
        title: i18next.t("general:Name"),
        dataIndex: 'name',
        key: 'name',
        width: '120px',
        fixed: 'left',
        sorter: true,
        ...this.getColumnSearchProps('name'),
        render: (text, record, index) => {
          return (
            <Link to={`/organizations/${text}`}>
              {text}
            </Link>
          )
        }
      },
      {
        title: i18next.t("general:Created time"),
        dataIndex: 'createdTime',
        key: 'createdTime',
        width: '160px',
        sorter: true,
        render: (text, record, index) => {
          return Setting.getFormattedDate(text);
        }
      },
      {
        title: i18next.t("general:Display name"),
        dataIndex: 'displayName',
        key: 'displayName',
        // width: '100px',
        sorter: true,
        ...this.getColumnSearchProps('displayName'),
      },
      {
        title: i18next.t("organization:Favicon"),
        dataIndex: 'favicon',
        key: 'favicon',
        width: '50px',
        render: (text, record, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={text}>
              <img src={text} alt={text} width={40} />
            </a>
          )
        }
      },
      {
        title: i18next.t("organization:Website URL"),
        dataIndex: 'websiteUrl',
        key: 'websiteUrl',
        width: '300px',
        sorter: true,
        ...this.getColumnSearchProps('websiteUrl'),
        render: (text, record, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={text}>
              {text}
            </a>
          )
        }
      },
      {
        title: i18next.t("general:Password type"),
        dataIndex: 'passwordType',
        key: 'passwordType',
        width: '150px',
        sorter: true,
        filterMultiple: false,
        filters: [
          {text: 'plain', value: 'plain'},
          {text: 'salt', value: 'salt'},
          {text: 'md5-salt', value: 'md5-salt'},
        ],
      },
      {
        title: i18next.t("general:Password salt"),
        dataIndex: 'passwordSalt',
        key: 'passwordSalt',
        width: '150px',
        sorter: true,
        ...this.getColumnSearchProps('passwordSalt'),
      },
      {
        title: i18next.t("organization:Default avatar"),
        dataIndex: 'defaultAvatar',
        key: 'defaultAvatar',
        width: '120px',
        render: (text, record, index) => {
          return (
              <a target="_blank" rel="noreferrer" href={text}>
                <img src={text} alt={text} width={40} />
              </a>
          )
        }
      },
      {
        title: i18next.t("organization:Soft deletion"),
        dataIndex: 'enableSoftDeletion',
        key: 'enableSoftDeletion',
        width: '140px',
        sorter: true,
        render: (text, record, index) => {
          return (
            <Switch disabled checkedChildren="ON" unCheckedChildren="OFF" checked={text} />
          )
        }
      },
      {
        title: i18next.t("general:Action"),
        dataIndex: '',
        key: 'op',
        width: '240px',
        fixed: (Setting.isMobile()) ? "false" : "right",
        render: (text, record, index) => {
          return (
            <div>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => this.props.history.push(`/organizations/${record.name}/users`)}>{i18next.t("general:Users")}</Button>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} onClick={() => this.props.history.push(`/organizations/${record.name}`)}>{i18next.t("general:Edit")}</Button>
              <Popconfirm
                title={`Sure to delete organization: ${record.name} ?`}
                onConfirm={() => this.deleteOrganization(index)}
                disabled={record.name === "built-in"}
              >
                <Button style={{marginBottom: '10px'}} disabled={record.name === "built-in"} type="danger">{i18next.t("general:Delete")}</Button>
              </Popconfirm>
            </div>
          )
        }
      },
    ];

    const paginationProps = {
      total: this.state.pagination.total,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: () => i18next.t("general:{total} in total").replace("{total}", this.state.pagination.total),
    };

    return (
      <div>
        <Table scroll={{x: 'max-content'}} columns={columns} dataSource={organizations} rowKey="name" size="middle" bordered pagination={paginationProps}
               title={() => (
                 <div>
                  {i18next.t("general:Organizations")}&nbsp;&nbsp;&nbsp;&nbsp;
                  <Button type="primary" size="small" onClick={this.addOrganization.bind(this)}>{i18next.t("general:Add")}</Button>
                 </div>
               )}
               loading={this.state.loading}
               onChange={this.handleTableChange}
        />
      </div>
    );
  }

  fetch = (params = {}) => {
    let field = params.searchedColumn, value = params.searchText;
    let sortField = params.sortField, sortOrder = params.sortOrder;
    if (params.passwordType !== undefined && params.passwordType !== null) {
      field = "passwordType";
      value = params.passwordType;
    }
    this.setState({ loading: true });
    OrganizationBackend.getOrganizations("admin", params.pagination.current, params.pagination.pageSize, field, value, sortField, sortOrder)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            loading: false,
            data: res.data,
            pagination: {
              ...params.pagination,
              total: res.data2,
            },
            searchText: params.searchText,
            searchedColumn: params.searchedColumn,
          });
        }
      });
  };
}

export default OrganizationListPage;
