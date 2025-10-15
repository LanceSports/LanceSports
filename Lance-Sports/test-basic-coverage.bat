@echo off
echo 🚀 Testing basic coverage on Windows...

echo 📦 Installing dependencies...
call npm install

echo 🔧 Installing coverage provider...
call npm install --save-dev @vitest/coverage-v8

echo 🧪 Running basic tests with coverage...
call npm run test:basic

echo 📁 Checking coverage files...
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
    
    echo ⏳ Waiting 15 seconds to see if files persist...
    timeout /t 15 /nobreak >nul
    
    if exist "coverage\lcov.info" (
        echo ✅ lcov.info still exists after 15 seconds!
        echo 📊 Coverage files are persisting correctly!
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

echo 🏁 Basic coverage test complete!
pause
