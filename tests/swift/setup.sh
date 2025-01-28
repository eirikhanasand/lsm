#!/bin/bash

# Exits on error
set -e

# Checks if required environment variables are set
if [[ -z "$JFROG_EMAIL" || -z "$JFROG_TOKEN" || -z "$JFROG_ID" ]]; then
  echo "Error: JFROG_EMAIL, JFROG_TOKEN, and JFROG_ID environment variables must be set."
  exit 1
fi

touch main.swift

# Replace main.swift with a simple Swift HTTP download example
cat > Sources/main.swift <<EOL
import Foundation

let url = URL(string: "https://httpbin.org/image/png")! // Test file
let semaphore = DispatchSemaphore(value: 0)

// Create a URL request
var request = URLRequest(url: url)
request.httpMethod = "GET"

// Start the download task
let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \\(error.localizedDescription)")
    } else if let response = response as? HTTPURLResponse, let data = data {
        print("HTTP Status Code: \\(response.statusCode)")
        print("Downloaded \\(data.count) bytes")
        
        // Save the file to /tmp/test_file.png
        let filePath = "/tmp/test_file.png"
        do {
            try data.write(to: URL(fileURLWithPath: filePath))
            print("File saved to \\(filePath)")
        } catch {
            print("Failed to save file: \\(error.localizedDescription)")
        }
    }
    semaphore.signal()
}

task.resume()
semaphore.wait()
EOL

# Build and run the Swift project
swift build
swift run
