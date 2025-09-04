#!/usr/bin/env python3
"""
Script to build React frontend and prepare it for Django serving
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

# Paths
DJANGO_DIR = Path(__file__).parent
REACT_DIR = DJANGO_DIR.parent
REACT_BUILD_DIR = REACT_DIR / 'dist'
DJANGO_STATIC_DIR = DJANGO_DIR / 'static'
DJANGO_TEMPLATES_DIR = DJANGO_DIR / 'templates'


def run_command(command, cwd=None):
    """Run a shell command and handle errors"""
    print(f"🔄 Running: {command}")
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            cwd=cwd,
            capture_output=True,
            text=True
        )
        print(f"✅ Command completed successfully")
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed with exit code {e.returncode}")
        print(f"Error output: {e.stderr}")
        sys.exit(1)


def build_react():
    """Build React application"""
    print("🏗️ Building React application...")
    
    # Check if package.json exists
    package_json = REACT_DIR / 'package.json'
    if not package_json.exists():
        print(f"❌ package.json not found at {package_json}")
        sys.exit(1)
    
    # Install dependencies if node_modules doesn't exist
    node_modules = REACT_DIR / 'node_modules'
    if not node_modules.exists():
        print("📦 Installing dependencies...")
        run_command("npm install", cwd=REACT_DIR)
    
    # Build the React app
    run_command("npm run build", cwd=REACT_DIR)
    
    # Check if build was successful
    if not REACT_BUILD_DIR.exists():
        print(f"❌ Build directory not found at {REACT_BUILD_DIR}")
        sys.exit(1)
    
    print("✅ React build completed successfully")


def prepare_django_static():
    """Prepare Django static directories"""
    print("📁 Preparing Django static directories...")
    
    # Create directories if they don't exist
    DJANGO_STATIC_DIR.mkdir(exist_ok=True)
    DJANGO_TEMPLATES_DIR.mkdir(exist_ok=True)
    
    # Clean existing static files (except admin)
    if DJANGO_STATIC_DIR.exists():
        for item in DJANGO_STATIC_DIR.iterdir():
            if item.name != 'admin':  # Keep Django admin static files
                if item.is_dir():
                    shutil.rmtree(item)
                else:
                    item.unlink()
    
    print("✅ Django static directories prepared")


def copy_react_build():
    """Copy React build files to Django static directory"""
    print("📋 Copying React build files...")
    
    # Copy all files from React build to Django static
    for item in REACT_BUILD_DIR.iterdir():
        dest_path = DJANGO_STATIC_DIR / item.name
        
        if item.is_dir():
            if dest_path.exists():
                shutil.rmtree(dest_path)
            shutil.copytree(item, dest_path)
            print(f"  📁 Copied directory: {item.name}")
        else:
            if item.name == 'index.html':
                # Copy index.html to templates directory
                template_dest = DJANGO_TEMPLATES_DIR / 'index.html'
                shutil.copy2(item, template_dest)
                print(f"  📄 Copied template: index.html")
            else:
                shutil.copy2(item, dest_path)
                print(f"  📄 Copied file: {item.name}")
    
    print("✅ React build files copied successfully")


def update_index_template():
    """Update the index.html template to work with Django static files"""
    print("🔧 Updating index.html template for Django...")
    
    template_path = DJANGO_TEMPLATES_DIR / 'index.html'
    
    if not template_path.exists():
        print("❌ index.html template not found")
        return
    
    # Read the current template
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace asset paths to use Django static files
    content = content.replace('"/assets/', '"/static/assets/')
    content = content.replace("'/assets/", "'/static/assets/")
    content = content.replace('href="/vite.svg"', 'href="/static/vite.svg"')
    
    # Write the updated template
    with open(template_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Template updated for Django static files")


def collect_static():
    """Run Django collectstatic command"""
    print("🗂️ Collecting Django static files...")
    
    try:
        run_command("python manage.py collectstatic --noinput", cwd=DJANGO_DIR)
        print("✅ Static files collected successfully")
    except:
        print("⚠️ collectstatic failed - make sure Django is properly configured")


def main():
    """Main build process"""
    print("🚀 Starting Django + React build process...\n")
    
    try:
        # Step 1: Build React
        build_react()
        print()
        
        # Step 2: Prepare Django directories
        prepare_django_static()
        print()
        
        # Step 3: Copy React build
        copy_react_build()
        print()
        
        # Step 4: Update template
        update_index_template()
        print()
        
        # Step 5: Collect static files
        collect_static()
        print()
        
        print("🎉 Build process completed successfully!")
        print("\n📝 Next steps:")
        print("1. Run: python manage.py migrate")
        print("2. Run: python manage.py init_users")
        print("3. Start server: python manage.py runserver")
        
    except Exception as e:
        print(f"❌ Build process failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()