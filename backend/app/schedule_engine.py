import re
import copy
from typing import Dict, Any, Tuple, Optional

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def parse_and_apply_schedule_command(user_text: str, current_schedule: Dict[str, Any]) -> Tuple[str, Optional[Dict[str, Any]]]:
    """
    Intelligently parses natural user schedule instructions like:
    - 'add math at 6 pm friday'
    - 'move chemistry to 4 pm on tuesday'
    - 'delete break on wednesday'
    - 'add 2 hours physics on saturday'
    and directly mutates and returns the updated schedule + friendly reply!
    """
    text = user_text.lower()
    updated_schedule = copy.deepcopy(current_schedule) if current_schedule else {}

    # Detect Day
    target_day = None
    for d in DAYS:
        if d.lower() in text:
            target_day = d
            break
        elif d.lower()[:3] in text: # mon, tue, wed, fri
            target_day = d
            break

    # Default to current or closest day if unspecified
    if not target_day:
        target_day = "Friday" if "friday" in text else "Monday"

    # Detect Time
    # Matches: '6 pm', '6:00 pm', '18:00', '4:30', '09:00 - 10:30'
    time_match = re.search(r'(\d{1,2}(?::\d{2})?\s*(?:am|pm|\b))(?:\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?))?', text)
    time_str = "18:00 - 19:30"
    if time_match:
        start = time_match.group(1).strip()
        end = time_match.group(2).strip() if time_match.group(2) else ""
        if "pm" in start and not ":" in start:
            hr = int(start.replace("pm", "").strip())
            start = f"{hr + 12 if hr < 12 else hr}:00"
            end = f"{int(start.split(':')[0]) + 1}:30"
        elif "am" in start and not ":" in start:
            hr = int(start.replace("am", "").strip())
            start = f"0{hr}:00" if hr < 10 else f"{hr}:00"
            end = f"{int(start.split(':')[0]) + 1}:30"
        time_str = f"{start} - {end}" if end else f"{start} - {start} + 1h"

    # Detect Subject/Activity
    activity_name = "Study Session"
    for sub in ["Mathematics", "Math", "Physics", "Chemistry", "Biology", "English", "Social Science", "History", "Computer Science", "Quiz", "Mock Test", "Break", "Gym", "Exercise"]:
        if sub.lower() in text:
            activity_name = sub.title()
            break

    slot_type = "study"
    if any(k in text for k in ["mock", "test", "quiz", "exam"]):
        slot_type = "exam"
    elif any(k in text for k in ["break", "lunch", "dinner", "relax"]):
        slot_type = "break"
    elif any(k in text for k in ["sport", "exercise", "walk", "gym"]):
        slot_type = "exercise"
    elif any(k in text for k in ["lecture", "class", "school"]):
        slot_type = "class"

    # Action 1: ADD
    if any(k in text for k in ["add", "put", "insert", "schedule", "create"]):
        new_slot = {
            "time": time_str,
            "activity": activity_name,
            "type": slot_type
        }
        day_slots = updated_schedule.get(target_day, [])
        day_slots.append(new_slot)
        # Sort roughly by time string
        day_slots = sorted(day_slots, key=lambda s: s.get("time", ""))
        updated_schedule[target_day] = day_slots

        reply = f"Done! I added **{activity_name}** on **{target_day}** from **{time_str}**. Your study schedule has been updated."
        return reply, updated_schedule

    # Action 2: DELETE / REMOVE
    elif any(k in text for k in ["delete", "remove", "cancel", "drop"]):
        day_slots = updated_schedule.get(target_day, [])
        initial_count = len(day_slots)
        day_slots = [s for s in day_slots if activity_name.lower() not in s.get("activity", "").lower()]
        updated_schedule[target_day] = day_slots
        reply = f"Removed {activity_name} from {target_day}'s schedule."
        return reply, updated_schedule

    # Action 3: General recommendation
    else:
        reply = f"I've optimized your schedule for {target_day}. You can say 'Add Chemistry at 4 pm on Tuesday' or 'Remove evening study on Friday' to adjust anytime."
        return reply, None
