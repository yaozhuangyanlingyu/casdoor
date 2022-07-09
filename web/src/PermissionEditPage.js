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
import {Button, Card, Col, Input, Row, Select, Switch} from 'antd';
import * as PermissionBackend from "./backend/PermissionBackend";
import * as OrganizationBackend from "./backend/OrganizationBackend";
import * as UserBackend from "./backend/UserBackend";
import * as Setting from "./Setting";
import i18next from "i18next";
import * as RoleBackend from "./backend/RoleBackend";
import * as ModelBackend from "./backend/ModelBackend";

const { Option } = Select;

class PermissionEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      organizationName: props.organizationName !== undefined ? props.organizationName : props.match.params.organizationName,
      permissionName: props.match.params.permissionName,
      permission: null,
      organizations: [],
      users: [],
      roles: [],
      models: [],
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getPermission();
    this.getOrganizations();
  }

  getPermission() {
    PermissionBackend.getPermission(this.state.organizationName, this.state.permissionName)
      .then((permission) => {
        this.setState({
          permission: permission,
        });

        this.getUsers(permission.owner);
        this.getRoles(permission.owner);
        this.getModels(permission.owner);
      });
  }

  getOrganizations() {
    OrganizationBackend.getOrganizations("admin")
      .then((res) => {
        this.setState({
          organizations: (res.msg === undefined) ? res : [],
        });
      });
  }

  getUsers(organizationName) {
    UserBackend.getUsers(organizationName)
      .then((res) => {
        this.setState({
          users: res,
        });
      });
  }

  getRoles(organizationName) {
    RoleBackend.getRoles(organizationName)
      .then((res) => {
        this.setState({
          roles: res,
        });
      });
  }

  getModels(organizationName) {
    ModelBackend.getModels(organizationName)
      .then((res) => {
        this.setState({
          models: res,
        });
      });
  }

  parsePermissionField(key, value) {
    if ([""].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updatePermissionField(key, value) {
    value = this.parsePermissionField(key, value);

    let permission = this.state.permission;
    permission[key] = value;
    this.setState({
      permission: permission,
    });
  }

  renderPermission() {
    return (
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("permission:New Permission") : i18next.t("permission:Edit Permission")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitPermissionEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: '20px'}} type="primary" onClick={() => this.submitPermissionEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: '20px'}} onClick={() => this.deletePermission()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={(Setting.isMobile())? {margin: '5px'}:{}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: '100%'}} value={this.state.permission.owner} onChange={(owner => {
              this.updatePermissionField('owner', owner);

              this.getUsers(owner);
              this.getRoles(owner);
            })}>
              {
                this.state.organizations.map((organization, index) => <Option key={index} value={organization.name}>{organization.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.permission.name} onChange={e => {
              this.updatePermissionField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Display name"), i18next.t("general:Display name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.permission.displayName} onChange={e => {
              this.updatePermissionField('displayName', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Model"), i18next.t("general:Model - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: '100%'}} value={this.state.permission.model} onChange={(model => {
              this.updatePermissionField('model', model);
            })}>
              {
                this.state.models.map((model, index) => <Option key={index} value={model.name}>{model.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("role:Sub users"), i18next.t("role:Sub users - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} mode="tags" style={{width: '100%'}} value={this.state.permission.users} onChange={(value => {this.updatePermissionField('users', value);})}>
              {
                this.state.users.map((user, index) => <Option key={index} value={`${user.owner}/${user.name}`}>{`${user.owner}/${user.name}`}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("role:Sub roles"), i18next.t("role:Sub roles - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} mode="tags" style={{width: '100%'}} value={this.state.permission.roles} onChange={(value => {this.updatePermissionField('roles', value);})}>
              {
                this.state.roles.filter(roles => (roles.owner !== this.state.roles.owner || roles.name !== this.state.roles.name)).map((permission, index) => <Option key={index} value={`${permission.owner}/${permission.name}`}>{`${permission.owner}/${permission.name}`}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("permission:Resource type"), i18next.t("permission:Resource type - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: '100%'}} value={this.state.permission.resourceType} onChange={(value => {
              this.updatePermissionField('resourceType', value);
            })}>
              {
                [
                  {id: 'Application', name: 'Application'},
                ].map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("permission:Actions"), i18next.t("permission:Actions - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} mode="tags" style={{width: '100%'}} value={this.state.permission.actions} onChange={(value => {
              this.updatePermissionField('actions', value);
            })}>
              {
                [
                  {id: 'Read', name: 'Read'},
                  {id: 'Write', name: 'Write'},
                  {id: 'Admin', name: 'Admin'},
                ].map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("permission:Effect"), i18next.t("permission:Effect - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: '100%'}} value={this.state.permission.effect} onChange={(value => {
              this.updatePermissionField('effect', value);
            })}>
              {
                [
                  {id: 'Allow', name: 'Allow'},
                  {id: 'Deny', name: 'Deny'},
                ].map((item, index) => <Option key={index} value={item.id}>{item.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={(Setting.isMobile()) ? 19 : 2}>
            {Setting.getLabel(i18next.t("general:Is enabled"), i18next.t("general:Is enabled - Tooltip"))} :
          </Col>
          <Col span={1} >
            <Switch checked={this.state.permission.isEnabled} onChange={checked => {
              this.updatePermissionField('isEnabled', checked);
            }} />
          </Col>
        </Row>
      </Card>
    )
  }

  submitPermissionEdit(willExist) {
    let permission = Setting.deepCopy(this.state.permission);
    PermissionBackend.updatePermission(this.state.organizationName, this.state.permissionName, permission)
      .then((res) => {
        if (res.msg === "") {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            permissionName: this.state.permission.name,
          });

          if (willExist) {
            this.props.history.push(`/permissions`);
          } else {
            this.props.history.push(`/permissions/${this.state.permission.owner}/${this.state.permission.name}`);
          }
        } else {
          Setting.showMessage("error", res.msg);
          this.updatePermissionField('name', this.state.permissionName);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `Failed to connect to server: ${error}`);
      });
  }

  deletePermission() {
    PermissionBackend.deletePermission(this.state.permission)
      .then(() => {
        this.props.history.push(`/permissions`);
      })
      .catch(error => {
        Setting.showMessage("error", `Permission failed to delete: ${error}`);
      });
  }

  render() {
    return (
      <div>
        {
          this.state.permission !== null ? this.renderPermission() : null
        }
        <div style={{marginTop: '20px', marginLeft: '40px'}}>
          <Button size="large" onClick={() => this.submitPermissionEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: '20px'}} type="primary" size="large" onClick={() => this.submitPermissionEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: '20px'}} size="large" onClick={() => this.deletePermission()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default PermissionEditPage;
