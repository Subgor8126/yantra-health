import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import pydicom

@csrf_exempt
def parse_dicom_file(request):
    print("in the dicom parser")
    if request.method == "POST":
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        
        try:
            # Read DICOM file
            dicom_data = pydicom.dcmread(uploaded_file)
            print("dicom data read")

            # Extract relevant metadata
            parsed_data = {
                "PatientID": dicom_data.PatientID,
                "PatientName": str(dicom_data.PatientName),
                "StudyDate": dicom_data.StudyDate,
                "Modality": dicom_data.Modality,
                # Add more fields as needed
            }
            print(f"here it is: {parsed_data}")

            return JsonResponse({"message": "File parsed successfully", "data": parsed_data})

        except Exception as e:
            print(f"Failed to delete DICOM file: {str(e)}")
            return JsonResponse({"error": f"Failed to delete DICOM file: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)