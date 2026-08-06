import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFillColor(11, 37, 69);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("CRA System — Relatório de Protocolos", 14, 14);
  doc.setFontSize(9);
  doc.setTextColor(230, 230, 230);
  doc.text(`Gerado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date())} · Ambiente de demonstração (dados fictícios)`, 14, 19);

  autoTable(doc, {
    startY: 28,
    head: [["Número", "Tipo", "Solicitante", "Responsável", "Prioridade", "Status", "Criado em", "Prazo"]],
    body: protocols.map((p) => [
      formatProtocolNumber(p.number),
      p.type,
      p.requester,
      p.responsible?.name ?? "Não atribuído",
      PRIORITY_LABEL[p.priority],
      STATUS_LABEL[p.status],
      formatDate(p.createdAt),
      formatDate(p.dueDate),
    ]),
    headStyles: { fillColor: [11, 37, 69], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    alternateRowStyles: { fillColor: [247, 247, 244] },
    margin: { left: 14, right: 14 },
  });

  const buffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-protocolos-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
