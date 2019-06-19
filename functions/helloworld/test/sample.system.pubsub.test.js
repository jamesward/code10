/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START functions_pubsub_system_test]
const childProcess = require('child_process');
const delay = require('delay');
const assert = require('assert');
const uuid = require('uuid');
const {PubSub} = require('@google-cloud/pubsub');
const moment = require('moment');
const promiseRetry = require('promise-retry');

const pubsub = new PubSub();
const topicName = process.env.FUNCTIONS_TOPIC;
const baseCmd = 'gcloud functions';

it('helloPubSub: should print a name', async () => {
  const name = uuid.v4();

  // Subtract time to work-around local-GCF clock difference
  const startTime = moment()
    .subtract(2, 'minutes')
    .toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  await topic.publish(Buffer.from(name));

  // Wait for logs to become consistent
  await promiseRetry(retry => {
    const logs = childProcess
      .execSync(`${baseCmd} logs read helloPubSub --start-time ${startTime}`)
      .toString();

    try {
      assert.ok(logs.includes(`Hello, ${name}!`));
    } catch (err) {
      retry(err);
    }
  });
});
// [END functions_pubsub_system_test]

it('helloPubSub: should print hello world', async () => {
  // Subtract time to work-around local-GCF clock difference
  const startTime = moment()
    .subtract(2, 'minutes')
    .toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  await topic.publish(Buffer.from(''), {a: 'b'});

  // Wait for logs to become consistent
  await promiseRetry(retry => {
    const logs = childProcess
      .execSync(`${baseCmd} logs read helloPubSub --start-time ${startTime}`)
      .toString();

    try {
      assert.ok(logs.includes(`Hello, World!`));
    } catch (err) {
      retry(err);
    }
  });
});
