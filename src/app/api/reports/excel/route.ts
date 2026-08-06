import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/lib/labels";
import { formatDate, formatProtocolNumber } from "@/lib/utils";
import type { Prisma, ProtocolStatus, Priority } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const where: Prisma.ProtocolWhereInput = {};
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const responsibleId = searchParams.get("responsibleId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  if (status) where.status = status as ProtocolStatus;
  if (priority) where.priority = priority as Priority;
  if (responsibleId) where.responsibleId = responsibleId;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const protocols = await prisma.protocol.findMany({
    where,
    include: { responsible: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CRA System";
  const sheet = workbook.addWorksheet("Protocolos");

  sheet.columns = [
    { header: "Número", key: "number", width: 20 },
    { header: "Tipo", key: "type", width: 28 },
    { header: "Solicitante", key: "requester", width: 22 },
    { header: "Responsável", key: "responsible", width: 22 },
    { header: "Prioridade", key: "priority", width: 12 },
    { header: "Status", key: "status", width: 20 },
    { header: "Criado em", key: "createdAt", width: 14 },
    { header: "Prazo", key: "dueDate", width: 14 },
    { header: "Descrição", key: "description", width: 40 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B2545" } };

  protocols.forEach((p) => {
    sheet.addRow({
      number: formatProtocolNumber(p.number),
      type: p.type,
      requester: p.requester,
      responsible: p.responsible?.name ?? "Não atribuído",
      priority: PRIORITY_LABEL[p.priority],
      status: STATUS_LABEL[p.status],
      createdAt: formatDate(p.createdAt),
      dueDate: formatDate(p.dueDate),
      description: p.description,
    });
  });

  sheet.autoFilter = { from: "A1", to: "I1" };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio-protocolos-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
