#!/usr/bin/env python3
"""
Quick setup script for Django Dashboard
"""

import os
import subprocess
import sys
from pathlib import Path

DJANGO_DIR = Path(__file__).parent


def run_command(command, cwd=None):
    """Run a shell command"""
    print(f"🔄 Running: {command}")
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            cwd=cwd or DJANGO_DIR
        )
        print(f"✅ Command completed")
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed with exit code {e.returncode}")
        return None


def check_python():
    """Check Python version"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major != 3 or version.minor < 8:
        print("❌ Python 3.8+ required")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")


def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    
    # Check if virtual environment exists
    venv_dir = DJANGO_DIR / 'venv'
    if not venv_dir.exists():
        print("🏗️ Creating virtual environment...")
        run_command(f"{sys.executable} -m venv venv")
    
    # Install requirements
    if os.name == 'nt':  # Windows
        pip_path = venv_dir / 'Scripts' / 'pip'
        python_path = venv_dir / 'Scripts' / 'python'
    else:  # Linux/Mac
        pip_path = venv_dir / 'bin' / 'pip'
        python_path = venv_dir / 'bin' / 'python'
    
    run_command(f"{pip_path} install -r requirements.txt")
    return python_path


def setup_database(python_path):
    """Setup Django database"""
    print("🗄️ Setting up database...")
    
    # Run migrations
    run_command(f"{python_path} manage.py makemigrations")
    run_command(f"{python_path} manage.py migrate")
    
    # Initialize users
    run_command(f"{python_path} manage.py init_users")


def setup_env_file():
    """Create .env file if it doesn't exist"""
    env_file = DJANGO_DIR / '.env'
    env_example = DJANGO_DIR / '.env.example'
    
    if not env_file.exists() and env_example.exists():
        print("🔧 Creating .env file...")
        import shutil
        shutil.copy(env_example, env_file)
        print("✅ .env file created (edit as needed)")


def main():
    """Main setup process"""
    print("🚀 Django Dashboard Setup\n")
    
    try:
        # Check Python version
        check_python()
        print()
        
        # Setup environment file
        setup_env_file()
        print()
        
        # Install dependencies
        python_path = install_dependencies()
        print()
        
        # Setup database
        setup_database(python_path)
        print()
        
        print("🎉 Setup completed successfully!\n")
        print("📝 Next steps:")
        print("1. Edit .env file if needed")
        print("2. Build frontend: python build_frontend.py")
        print("3. Start server: python manage.py runserver")
        print("\n👥 Default users created:")
        print("   Admin: admin/admin123")
        print("   Viewer: viewer/viewer123")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()