<?php
/**
 * PHP backend submit handler for Student Equivalent Certificate Form
 * PHP 7.4+ compatible, ready for Stinger Hosting
 */

// Enable CORS and JSON output headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "طريقة الطلب غير صالحة. يجب استخدام POST."
    ]);
    exit();
}

try {
    // Read raw input stream
    $rawInput = file_get_contents("php://input");
    if (empty($rawInput)) {
        throw new Exception("لم يتم استلام أي بيانات.");
    }

    // Decode JSON payload
    $data = json_decode($rawInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("تنسيق البيانات المستلمة غير صالح.");
    }

    // Basic Validation
    $requiredFields = ['studentName', 'nationalId', 'certification', 'track', 'yearOfStudy', 'photo', 'grades'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("الحقل المطلوب ناقص: " . $field);
        }
    }

    // Sanitize National ID for filename purposes (only alphanumeric/dash/underscore)
    $nationalId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $data['nationalId']);
    if (empty($nationalId)) {
        throw new Exception("الرقم القومي غير صالح.");
    }

    // Create directories if they do not exist
    $uploadDir = __DIR__ . '/../uploads';
    $submissionDir = __DIR__ . '/../submissions';

    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    if (!file_exists($submissionDir)) {
        mkdir($submissionDir, 0755, true);
    }

    // Parse and decode base64 student photo
    $photoBase64 = $data['photo'];
    if (preg_match('/^data:image\/(\w+);base64,/', $photoBase64, $typeMatches)) {
        $imgType = strtolower($typeMatches[1]); // e.g. png, jpeg, webp
        
        // Normalize jpeg extension
        if ($imgType === 'jpeg') {
            $imgType = 'jpg';
        }

        if (!in_array($imgType, ['jpg', 'png', 'webp'])) {
            throw new Exception("صيغة الصورة غير مدعومة. يجب أن تكون JPG أو PNG أو WebP.");
        }

        // Get actual base64 content
        $photoData = substr($photoBase64, strpos($photoBase64, ',') + 1);
        $decodedPhoto = base64_decode($photoData);

        if ($decodedPhoto === false) {
            throw new Exception("فشل فك تشفير بيانات الصورة.");
        }

        // Write photo file
        $photoFilename = $nationalId . '.' . $imgType;
        $photoPath = $uploadDir . '/' . $photoFilename;
        
        if (file_put_contents($photoPath, $decodedPhoto) === false) {
            throw new Exception("فشل حفظ ملف الصورة الشخصية على الخادم.");
        }
        
        // Store relative path in JSON response
        $data['photoPath'] = 'uploads/' . $photoFilename;
    } else {
        throw new Exception("بيانات الصورة المستلمة غير صالحة.");
    }

    // Save submission data as JSON file
    $submissionFilename = $nationalId . '_' . time() . '.json';
    $submissionPath = $submissionDir . '/' . $submissionFilename;

    // Remove raw base64 data to keep JSON file lightweight (optional, but let's keep it in relative photoPath, or leave it depending on requirement)
    // To match the exact sample payload, let's keep it, but add a photoPath field.
    $jsonPayload = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if (file_put_contents($submissionPath, $jsonPayload) === false) {
        throw new Exception("فشل حفظ بيانات استمارة الطالب.");
    }

    // Send success response
    echo json_encode([
        "status" => "success",
        "message" => "تم حفظ استمارة الطالب بنجاح.",
        "file_path" => $data['photoPath']
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
