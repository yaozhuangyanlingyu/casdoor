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
	"io/ioutil"

	"github.com/casdoor/casdoor/util"
)

func InitDb() {
	existed := initBuiltInOrganization()
	if !existed {
		initBuiltInProvider()
		initBuiltInUser()
		initBuiltInApplication()
		initBuiltInCert()
		initBuiltInLdap()
	}
}

func initBuiltInOrganization() bool {
	organization := getOrganization("admin", "built-in")
	if organization != nil {
		return true
	}

	organization = &Organization{
		Owner:         "admin",
		Name:          "built-in",
		CreatedTime:   util.GetCurrentTime(),
		DisplayName:   "Built-in Organization",
		WebsiteUrl:    "https://example.com",
		Favicon:       "https://cdn.casbin.com/static/favicon.ico",
		PasswordType:  "plain",
		PhonePrefix:   "86",
		DefaultAvatar: "https://casbin.org/img/casbin.svg",
		Tags:          []string{},
		AccountItems: []*AccountItem{
			{Name: "Organization", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
			{Name: "ID", Visible: true, ViewRule: "Public", ModifyRule: "Immutable"},
			{Name: "Name", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
			{Name: "Display name", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "Avatar", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "User type", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
			{Name: "Password", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
			{Name: "Email", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "Phone", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "Country/Region", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "Location", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "Affiliation", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "Title", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "Homepage", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "Bio", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
			{Name: "Tag", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
			{Name: "Signup application", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
			{Name: "3rd-party logins", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
			{Name: "Properties", Visible: false, ViewRule: "Admin", ModifyRule: "Admin"},
			{Name: "Is admin", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
			{Name: "Is global admin", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
			{Name: "Is forbidden", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
			{Name: "Is deleted", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
		},
	}
	AddOrganization(organization)
	return false
}

func initBuiltInUser() {
	user := getUser("built-in", "admin")
	if user != nil {
		return
	}

	user = &User{
		Owner:             "built-in",
		Name:              "admin",
		CreatedTime:       util.GetCurrentTime(),
		Id:                util.GenerateId(),
		Type:              "normal-user",
		Password:          "123",
		DisplayName:       "Admin",
		Avatar:            "https://casbin.org/img/casbin.svg",
		Email:             "admin@example.com",
		Phone:             "12345678910",
		Address:           []string{},
		Affiliation:       "Example Inc.",
		Tag:               "staff",
		Score:             2000,
		Ranking:           1,
		IsAdmin:           true,
		IsGlobalAdmin:     true,
		IsForbidden:       false,
		IsDeleted:         false,
		SignupApplication: "app-built-in",
		CreatedIp:         "127.0.0.1",
		Properties:        make(map[string]string),
	}
	AddUser(user)
}

func initBuiltInApplication() {
	application := getApplication("admin", "app-built-in")
	if application != nil {
		return
	}

	application = &Application{
		Owner:          "admin",
		Name:           "app-built-in",
		CreatedTime:    util.GetCurrentTime(),
		DisplayName:    "Casdoor",
		Logo:           "https://cdn.casbin.com/logo/logo_1024x256.png",
		HomepageUrl:    "https://casdoor.org",
		Organization:   "built-in",
		Cert:           "cert-built-in",
		EnablePassword: true,
		EnableSignUp:   true,
		Providers: []*ProviderItem{
			{Name: "provider_captcha_default", CanSignUp: false, CanSignIn: false, CanUnlink: false, Prompted: false, AlertType: "None", Provider: nil},
		},
		SignupItems: []*SignupItem{
			{Name: "ID", Visible: false, Required: true, Prompted: false, Rule: "Random"},
			{Name: "Username", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Display name", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Password", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Confirm password", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Email", Visible: true, Required: true, Prompted: false, Rule: "Normal"},
			{Name: "Phone", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Agreement", Visible: true, Required: true, Prompted: false, Rule: "None"},
		},
		RedirectUris:  []string{},
		ExpireInHours: 168,
	}
	AddApplication(application)
}

func readTokenFromFile() (string, string) {
	pemPath := "./object/token_jwt_key.pem"
	keyPath := "./object/token_jwt_key.key"
	pem, err := ioutil.ReadFile(pemPath)
	if err != nil {
		return "", ""
	}
	key, err := ioutil.ReadFile(keyPath)
	if err != nil {
		return "", ""
	}
	return string(pem), string(key)
}

func initBuiltInCert() {
	tokenJwtPublicKey, tokenJwtPrivateKey := readTokenFromFile()
	cert := getCert("admin", "cert-built-in")
	if cert != nil {
		return
	}

	cert = &Cert{
		Owner:           "admin",
		Name:            "cert-built-in",
		CreatedTime:     util.GetCurrentTime(),
		DisplayName:     "Built-in Cert",
		Scope:           "JWT",
		Type:            "x509",
		CryptoAlgorithm: "RS256",
		BitSize:         4096,
		ExpireInYears:   20,
		PublicKey:       tokenJwtPublicKey,
		PrivateKey:      tokenJwtPrivateKey,
	}
	AddCert(cert)
}

func initBuiltInLdap() {
	ldap := GetLdap("ldap-built-in")
	if ldap != nil {
		return
	}

	ldap = &Ldap{
		Id:         "ldap-built-in",
		Owner:      "built-in",
		ServerName: "BuildIn LDAP Server",
		Host:       "example.com",
		Port:       389,
		Admin:      "cn=buildin,dc=example,dc=com",
		Passwd:     "123",
		BaseDn:     "ou=BuildIn,dc=example,dc=com",
		AutoSync:   0,
		LastSync:   "",
	}
	AddLdap(ldap)
}

func initBuiltInProvider() {
	provider := GetProvider("admin/provider_captcha_default")
	if provider != nil {
		return
	}

	provider = &Provider{
		Owner:       "admin",
		Name:        "provider_captcha_default",
		CreatedTime: util.GetCurrentTime(),
		DisplayName: "Captcha Default",
		Category:    "Captcha",
		Type:        "Default",
	}
	AddProvider(provider)
}
