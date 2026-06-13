#!/bin/bash

cd C:/Users/RAZER/source/FinalProject_Vinh/quiz-app-be

# Try to compile TypeScript
npx tsc --noEmit 2>&1 | head -50
