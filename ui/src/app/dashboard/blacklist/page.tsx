import getPackages from "@/utils/filtering/getPackage"
import fetchRepositories from "@/utils/fetchRepositories"
import AddPackage from "@/components/addPackage"

export default async function page() {
    const list = 'blacklist'
    // const packages = await getPackages({list, side: 'server'})
    const packages = [
        {
           "name":"abc",
           "comment":"abc",
           "versions":[
              "1.0.0",
              "3.0.0"
           ],
           "ecosystems":[
              "alpine",
              "cocoapods"
           ],
           "repositories":[
              "[REMOTE] alpine",
              "[VIRTUAL] maven-virtual-test"
           ],
           "references":[
              "https://abc.com",
              "https://vg.no",
              "https://google.com"
           ],
           "authors":[
              {
                 "id":"951849546286239794",
                 "name":"login0001",
                 "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
              }
           ],
           "created":{
              "id":"951849546286239794",
              "name":"login0001",
              "time":"2025-03-15T01:35:35.768044",
              "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
           },
           "updated":{
              "id":"951849546286239794",
              "name":"login0001",
              "time":"2025-03-15T01:35:35.768463",
              "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
           },
           "changeLog":[
              {
                 "id":26,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":25,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":24,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":23,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":22,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":21,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":20,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":19,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":18,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":17,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":16,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":15,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":14,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":13,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":12,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":11,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":10,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":9,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":8,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":7,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":6,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":5,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":4,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":3,
                 "name":"abc",
                 "event":"Updated abc with versions 1.0.0,3.0.0 with ecosystems alpine, cocoapods to the blacklist for [REMOTE] alpine, [VIRTUAL] maven-virtual-test with comment abc and references https://abc.com,                     https://vg.no,                     https://google.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:37:44.023947"
              },
              {
                 "id":2,
                 "name":"abc",
                 "event":"Added abc versions 3.0.0 with ecosystems cocoapods to the blacklist for [VIRTUAL] maven-virtual-test with comment abc and references https://vg.no.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:36:11.11504"
              },
              {
                 "id":1,
                 "name":"abc",
                 "event":"Added abc versions 1.0.0 with ecosystems alpine to the blacklist for [REMOTE] alpine with comment abc and references https://abc.com.",
                 "author":{
                    "id":"951849546286239794",
                    "name":"login0001",
                    "avatar":"355e71a6a8b57bc3e292d08e2f09f04c"
                 },
                 "timestamp":"2025-03-15T01:35:35.768862"
              }
           ]
        }
     ]
    const repositories = await fetchRepositories()
    return <AddPackage list={list} packages={packages} repositories={repositories} />
}
