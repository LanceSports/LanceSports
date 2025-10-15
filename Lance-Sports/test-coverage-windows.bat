@echo off
echo 🚀 Testing coverage setup on Windows...

echo 📦 Installing dependencies...
call npm install

echo 🔧 Installing coverage provider...
call npm install --save-dev @vitest/coverage-v8

echo 🧪 Running simple tests with coverage...
call npm run test:simple

echo 📁 Checking coverage files immediately...
if exist "coverage" (
    echo ✅ Coverage directory found!
    dir coverage
    
    if exist "coverage\lcov.info" (
        echo ✅ lcov.info file found!
        echo 📄 File size: 
        dir coverage\lcov.info
        echo 📄 First few lines:
        type coverage\lcov.info | more
    ) else (
        echo ❌ lcov.info file not found!
    )
    
    echo 🔄 Backing up coverage files...
    if not exist "coverage-backup" mkdir coverage-backup
    xcopy coverage\* coverage-backup\ /E /I /Y
    
    echo ⏳ Waiting 10 seconds to see if files persist...
    timeout /t 10 /nobreak >nul
    
    if exist "coverage\lcov.info" (
        echo ✅ lcov.info still exists after 10 seconds!
    ) else (
        echo ❌ lcov.info was deleted! Restoring from backup...
        if exist "coverage-backup\lcov.info" (
            copy coverage-backup\lcov.info coverage\lcov.info
            echo ✅ Restored lcov.info from backup!
        )
    )
) else (
    echo ❌ Coverage directory not found!
)

echo 🏁 Test complete!
pause


