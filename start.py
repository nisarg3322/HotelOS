import subprocess
import sys
import os

# Change to the backend directory
backend_dir = "backend"

try:
    os.chdir(backend_dir)  # Change working directory
    print(f"Changed directory to: {os.getcwd()}")
except FileNotFoundError:
    print(f"Error: Directory '{backend_dir}' not found.")
    sys.exit(1)


def run_command(command, continue_on_error=False):
    try:
        print(f"Running: {command}")
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(
            f"Error: Command '{command}' failed with exit code {e.returncode}")
        print(f"Error Message: {e.stderr}")

        if not continue_on_error:
            sys.exit(1)  # Exit the script if continue_on_error is False


# Run the commands inside backend directory
run_command("npm install")
run_command("docker-compose down")
# Ignore errors if volume is missing
run_command("docker volume rm e-hotel_pgdata", continue_on_error=True)
run_command("docker-compose up --build ")
