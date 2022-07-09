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
	"fmt"

	"github.com/robfig/cron/v3"
)

var cronMap map[string]*cron.Cron

func init() {
	cronMap = map[string]*cron.Cron{}
}

func getCronMap(name string) *cron.Cron {
	m, ok := cronMap[name]
	if !ok {
		m = cron.New()
		cronMap[name] = m
	}
	return m
}

func clearCron(name string) {
	cron, ok := cronMap[name]
	if ok {
		cron.Stop()
		delete(cronMap, name)
	}
}

func addSyncerJob(syncer *Syncer) {
	deleteSyncerJob(syncer)

	if !syncer.IsEnabled {
		return
	}

	syncer.initAdapter()

	syncer.syncUsers()

	schedule := fmt.Sprintf("@every %ds", syncer.SyncInterval)
	cron := getCronMap(syncer.Name)
	_, err := cron.AddFunc(schedule, syncer.syncUsers)
	if err != nil {
		panic(err)
	}

	cron.Start()
}

func deleteSyncerJob(syncer *Syncer) {
	clearCron(syncer.Name)
}
