# 📝 Dynamic Quiz Builder System

## Overview
Google Forms-style quiz builder with full MCQ support, dynamic options, and real-time editing.

---

## ✨ Features

### 1. **Quiz Creation**
- Create quiz with title, description, course mapping
- Set total marks, duration, passing marks
- Configure max attempts

### 2. **Question Builder** (Google Forms Style)
- ✅ Add unlimited questions
- ✅ Drag-and-drop reordering (visual indicator with GripVertical icon)
- ✅ Each question has:
  - Question text (multi-line textarea)
  - Marks allocation (editable per question)
  - Question order (auto-managed)
  - Optional explanation for correct answer

### 3. **Dynamic MCQ Options**
- ✅ Start with 4 default options (A, B, C, D)
- ✅ Add more options dynamically (unlimited)
- ✅ Remove options (minimum 2 required)
- ✅ Mark correct answer with green checkmark
- ✅ Auto-unmark other options when selecting correct answer
- ✅ Options labeled alphabetically (A, B, C, D, E, F...)

### 4. **Real-time Features**
- Live question count
- Auto-save draft capability
- Validation before saving
- Preview mode

---

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: Purple gradient (`from-purple-600 to-purple-800`)
- **Success**: Green (`bg-green-500` for correct answers)
- **Danger**: Red (`text-red-600` for delete actions)

### Interactive Elements
1. **Correct Answer Selection**
   - Click circular button to mark/unmark
   - Green fill with checkmark when selected
   - Only one correct answer per question

2. **Option Management**
   - Hover to show delete button
   - Smooth animations with Framer Motion
   - Clean, minimal design

3. **Question Cards**
   - Shadow on hover
   - Numbered badges
   - Grip handle for future drag-drop

---

## 🔧 Technical Implementation

### Frontend Structure
```
/ems/academic-manager/quizzes/
├── page.tsx              # Quiz list
└── builder/
    └── page.tsx          # Quiz builder (NEW)
```

### Backend APIs
```
POST   /api/ems/quizzes                    # Create quiz
GET    /api/ems/quizzes/:id                # Get quiz details
PUT    /api/ems/quizzes/:id                # Update quiz
DELETE /api/ems/quizzes/:id                # Delete quiz
GET    /api/ems/quizzes/:id/questions      # Get questions
POST   /api/ems/quizzes/:id/questions      # Save questions
```

### Database Schema
```sql
-- Quiz Questions
ems.quiz_questions
- id
- company_id
- quiz_id
- question_text
- question_type (MCQ, TRUE_FALSE, etc.)
- question_order
- marks
- explanation
- is_active

-- Quiz Options
ems.quiz_options
- id
- question_id
- option_text
- option_order
- is_correct
```

---

## 📋 Usage Flow

### For Academic Manager

1. **Create Quiz**
   ```
   Quizzes Page → "Create Quiz" → Fill details → Create
   ```

2. **Build Questions**
   ```
   Quiz Card → "Build Quiz" → Add Questions → Configure Options → Save
   ```

3. **Add Question**
   ```
   Click "Add Question" → 
   Enter question text → 
   Fill options → 
   Mark correct answer → 
   Add explanation (optional)
   ```

4. **Manage Options**
   ```
   - Click "+" to add more options
   - Click trash icon to remove option
   - Click circle to mark as correct
   ```

5. **Save Quiz**
   ```
   Click "Save Quiz" → All questions saved to database
   ```

---

## 🎯 Example Use Cases

### Software Development Quiz
```
Question 1: What is React?
A. A JavaScript library ✓ (Correct)
B. A programming language
C. A database
D. An operating system

Marks: 2
Explanation: React is a JavaScript library for building user interfaces.
```

### Accounting Quiz
```
Question 1: What is the accounting equation?
A. Assets = Liabilities + Equity ✓ (Correct)
B. Assets = Liabilities - Equity
C. Assets + Liabilities = Equity
D. None of the above

Marks: 1
Explanation: The fundamental accounting equation is Assets = Liabilities + Equity
```

### Finance Quiz
```
Question 1: What is NPV?
A. Net Present Value ✓ (Correct)
B. New Product Value
C. National Product Value
D. Net Profit Value

Marks: 3
Explanation: NPV stands for Net Present Value, used in capital budgeting.
```

---

## 🚀 Future Enhancements

### Phase 2 (Planned)
- [ ] Drag-and-drop question reordering
- [ ] Question bank/library
- [ ] Import questions from Excel/CSV
- [ ] Question types: True/False, Fill-in-blanks, Match-the-following
- [ ] Image support in questions and options
- [ ] Question randomization settings
- [ ] Time limit per question
- [ ] Question categories/tags

### Phase 3 (Planned)
- [ ] AI-powered question generation
- [ ] Difficulty level auto-detection
- [ ] Analytics on question performance
- [ ] Duplicate quiz functionality
- [ ] Version control for quizzes

---

## 🔒 Security Features

1. **Multi-tenant Isolation**
   - All queries filtered by `company_id`
   - User can only access their company's quizzes

2. **Validation**
   - Required fields enforced
   - Minimum 2 options per question
   - At least 1 correct answer required

3. **Audit Trail**
   - `created_by` and `updated_by` tracked
   - Soft delete with `deleted_at`

---

## 📊 Data Flow

```
User Creates Quiz
    ↓
Quiz saved to ems.quizzes
    ↓
User clicks "Build Quiz"
    ↓
Quiz Builder Page loads
    ↓
User adds questions + options
    ↓
Click "Save Quiz"
    ↓
POST /api/ems/quizzes/:id/questions
    ↓
Delete old questions (if any)
    ↓
Insert new questions → ems.quiz_questions
    ↓
Insert options → ems.quiz_options
    ↓
Update quiz.total_questions count
    ↓
Success! Redirect to quiz list
```

---

## 💡 Tips for Users

1. **Question Writing**
   - Keep questions clear and concise
   - Avoid ambiguous wording
   - Use proper grammar

2. **Options**
   - Make distractors plausible
   - Avoid "all of the above" or "none of the above"
   - Keep option length similar

3. **Explanations**
   - Always add explanations for learning
   - Reference course materials
   - Keep it brief but informative

---

## 🐛 Known Issues & Limitations

1. **Current Limitations**
   - No drag-drop reordering yet (coming soon)
   - Single correct answer only (no multi-select)
   - No image upload yet

2. **Browser Support**
   - Modern browsers only (Chrome, Firefox, Safari, Edge)
   - Mobile responsive but desktop recommended for building

---

## 📞 Support

For issues or feature requests:
- Contact: Academic Manager Dashboard → Settings → Support
- Email: support@durkkas.in

---

**Last Updated**: 2026-02-01  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
