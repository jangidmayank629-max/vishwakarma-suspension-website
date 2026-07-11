import os
import cv2
import numpy as np

video_path = r"C:\Users\jangi\Downloads\Video Project 1.mp4"
output_dir = r"C:\Users\jangi\Downloads\video_frames_24fps"

def main():
    # Check if video file exists
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return

    # Open the video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}")
        return

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"Video Info:")
    print(f"Path: {video_path}")
    print(f"Total Frames: {total_frames}")
    print(f"FPS: {fps}")
    print(f"Resolution: {width}x{height}")

    # Determine 24 evenly spaced frame indices spanning from first to last frame
    frame_indices = np.linspace(0, total_frames - 1, 24, dtype=int)
    print(f"Target frame indices to extract: {list(frame_indices)}")

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Extract frames
    extracted_count = 0
    for idx, frame_idx in enumerate(frame_indices, start=1):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            print(f"Warning: Could not read frame at index {frame_idx}")
            continue
        
        # Save as PNG
        filename = f"frame_{idx:02d}.png"
        out_path = os.path.join(output_dir, filename)
        success = cv2.imwrite(out_path, frame)
        if success:
            print(f"Successfully saved {filename} (frame index {frame_idx})")
            extracted_count += 1
        else:
            print(f"Error: Failed to save {filename}")

    cap.release()
    print(f"\nDone! Extracted {extracted_count} of 24 frames as PNG images to {output_dir}")

if __name__ == "__main__":
    main()
