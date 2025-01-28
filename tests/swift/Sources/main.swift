import Foundation

let url = URL(string: "https://httpbin.org/image/png")!
let semaphore = DispatchSemaphore(value: 0)

// Create a URL request
var request = URLRequest(url: url)
request.httpMethod = "GET"

// Start the download task
let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let error = error {
        print("Error: \(error.localizedDescription)")
    } else if let response = response as? HTTPURLResponse, let data = data {
        print("HTTP Status Code: \(response.statusCode)")
        print("Downloaded \(data.count) bytes")
        
        // Save the file to /tmp/test_file.png
        let filePath = "/tmp/test_file.png"
        do {
            try data.write(to: URL(fileURLWithPath: filePath))
            print("File saved to \(filePath)")
        } catch {
            print("Failed to save file: \(error.localizedDescription)")
        }
    }
    semaphore.signal()
}

task.resume()
semaphore.wait()
