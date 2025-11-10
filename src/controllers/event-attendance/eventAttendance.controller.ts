import { Request, Response } from "express";
//import { AttendEventDto } from "../../dtos/event/event-attendance.dto";
import * as EventAttendanceService from "../../services/event-attendance/eventAttendance.service";


export const createAttendance = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { eventId } = req.params;
    const result = await EventAttendanceService.attendEvent(String(userId), eventId);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export const listAttendances = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const attendees = await EventAttendanceService.getAttendees(eventId);
    return res.json(attendees);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

