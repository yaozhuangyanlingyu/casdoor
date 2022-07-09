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

package object

import (
	"github.com/casdoor/casdoor/cred"
	"github.com/casdoor/casdoor/util"
	"xorm.io/core"
)

type AccountItem struct {
	Name       string `json:"name"`
	Visible    bool   `json:"visible"`
	ViewRule   string `json:"viewRule"`
	ModifyRule string `json:"modifyRule"`
}

type Organization struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	DisplayName        string   `xorm:"varchar(100)" json:"displayName"`
	WebsiteUrl         string   `xorm:"varchar(100)" json:"websiteUrl"`
	Favicon            string   `xorm:"varchar(100)" json:"favicon"`
	PasswordType       string   `xorm:"varchar(100)" json:"passwordType"`
	PasswordSalt       string   `xorm:"varchar(100)" json:"passwordSalt"`
	PhonePrefix        string   `xorm:"varchar(10)"  json:"phonePrefix"`
	DefaultAvatar      string   `xorm:"varchar(100)" json:"defaultAvatar"`
	Tags               []string `xorm:"mediumtext" json:"tags"`
	MasterPassword     string   `xorm:"varchar(100)" json:"masterPassword"`
	EnableSoftDeletion bool     `json:"enableSoftDeletion"`
	IsProfilePublic    bool     `json:"isProfilePublic"`

	AccountItems []*AccountItem `xorm:"varchar(2000)" json:"accountItems"`
}

func GetOrganizationCount(owner, field, value string) int {
	session := GetSession(owner, -1, -1, field, value, "", "")
	count, err := session.Count(&Organization{})
	if err != nil {
		panic(err)
	}

	return int(count)
}

func GetOrganizations(owner string) []*Organization {
	organizations := []*Organization{}
	err := adapter.Engine.Desc("created_time").Find(&organizations, &Organization{Owner: owner})
	if err != nil {
		panic(err)
	}

	return organizations
}

func GetPaginationOrganizations(owner string, offset, limit int, field, value, sortField, sortOrder string) []*Organization {
	organizations := []*Organization{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&organizations)
	if err != nil {
		panic(err)
	}

	return organizations
}

func getOrganization(owner string, name string) *Organization {
	if owner == "" || name == "" {
		return nil
	}

	organization := Organization{Owner: owner, Name: name}
	existed, err := adapter.Engine.Get(&organization)
	if err != nil {
		panic(err)
	}

	if existed {
		return &organization
	}

	return nil
}

func GetOrganization(id string) *Organization {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getOrganization(owner, name)
}

func GetMaskedOrganization(organization *Organization) *Organization {
	if organization == nil {
		return nil
	}

	if organization.MasterPassword != "" {
		organization.MasterPassword = "***"
	}
	return organization
}

func GetMaskedOrganizations(organizations []*Organization) []*Organization {
	for _, organization := range organizations {
		organization = GetMaskedOrganization(organization)
	}
	return organizations
}

func UpdateOrganization(id string, organization *Organization) bool {
	owner, name := util.GetOwnerAndNameFromId(id)
	if getOrganization(owner, name) == nil {
		return false
	}

	if name == "built-in" {
		organization.Name = name
	}

	if name != organization.Name {
		go func() {
			application := new(Application)
			application.Organization = organization.Name
			_, _ = adapter.Engine.Where("organization=?", name).Update(application)

			user := new(User)
			user.Owner = organization.Name
			_, _ = adapter.Engine.Where("owner=?", name).Update(user)
		}()
	}

	if organization.MasterPassword != "" && organization.MasterPassword != "***" {
		credManager := cred.GetCredManager(organization.PasswordType)
		if credManager != nil {
			hashedPassword := credManager.GetHashedPassword(organization.MasterPassword, "", organization.PasswordSalt)
			organization.MasterPassword = hashedPassword
		}
	}

	session := adapter.Engine.ID(core.PK{owner, name}).AllCols()
	if organization.MasterPassword == "***" {
		session.Omit("master_password")
	}
	affected, err := session.Update(organization)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func AddOrganization(organization *Organization) bool {
	affected, err := adapter.Engine.Insert(organization)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func DeleteOrganization(organization *Organization) bool {
	if organization.Name == "built-in" {
		return false
	}

	affected, err := adapter.Engine.ID(core.PK{organization.Owner, organization.Name}).Delete(&Organization{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func GetOrganizationByUser(user *User) *Organization {
	return getOrganization("admin", user.Owner)
}
