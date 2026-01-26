-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('INDIVIDUAL', 'DOBLES_VARONIL', 'DOBLES_FEMENIL', 'DOBLES_MIXTO');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('NEED_PARTNER', 'PENDING', 'COMPLETE', 'WAITLIST', 'CANCELED');

-- CreateEnum
CREATE TYPE "PricingTier" AS ENUM ('EARLY', 'REGULAR', 'LATE');

-- CreateEnum
CREATE TYPE "CapacityCountingMode" AS ENUM ('COUNT_COMPLETE_ONLY', 'COUNT_ALL');

-- CreateEnum
CREATE TYPE "OnFullAction" AS ENUM ('ADD_TO_WAITLIST', 'REJECT');

-- CreateEnum
CREATE TYPE "RosterOrderingMode" AS ENUM ('STATUS_THEN_NAME', 'NAME_THEN_STATUS');

-- CreateEnum
CREATE TYPE "AfterPartnerDeadlineAction" AS ENUM ('MOVE_TO_WAITLIST', 'CANCEL_ENTRY');

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "usdToMxnRate" DECIMAL(10,2) NOT NULL,
    "mxnRoundingIncrement" INTEGER NOT NULL,
    "earlyPricingStart" TIMESTAMP(3) NOT NULL,
    "earlyPricingEnd" TIMESTAMP(3) NOT NULL,
    "regularPricingStart" TIMESTAMP(3) NOT NULL,
    "regularPricingEnd" TIMESTAMP(3) NOT NULL,
    "latePricingStart" TIMESTAMP(3) NOT NULL,
    "latePricingEnd" TIMESTAMP(3) NOT NULL,
    "earlyPriceUsd" DECIMAL(10,2) NOT NULL,
    "regularPriceUsd" DECIMAL(10,2) NOT NULL,
    "latePriceUsd" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentPolicy" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "rosterVisibleStatuses" "EntryStatus"[] NOT NULL DEFAULT ARRAY['COMPLETE', 'PENDING', 'NEED_PARTNER']::"EntryStatus"[],
    "rosterOrderingMode" "RosterOrderingMode" NOT NULL DEFAULT 'STATUS_THEN_NAME',
    "capacityCountingMode" "CapacityCountingMode" NOT NULL DEFAULT 'COUNT_COMPLETE_ONLY',
    "onFullAction" "OnFullAction" NOT NULL DEFAULT 'ADD_TO_WAITLIST',
    "afterPartnerDeadlineAction" "AfterPartnerDeadlineAction" NOT NULL DEFAULT 'MOVE_TO_WAITLIST',
    "partnerDeadline" TIMESTAMP(3),

    CONSTRAINT "TournamentPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPolicyOverride" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rosterVisibleStatuses" "EntryStatus"[],
    "rosterOrderingMode" "RosterOrderingMode",
    "capacityCountingMode" "CapacityCountingMode",
    "onFullAction" "OnFullAction",
    "afterPartnerDeadlineAction" "AfterPartnerDeadlineAction",
    "partnerDeadline" TIMESTAMP(3),

    CONSTRAINT "EventPolicyOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "manageToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventEntry" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "EntryStatus" NOT NULL DEFAULT 'PENDING',
    "pricingTier" "PricingTier" NOT NULL,
    "amountUsd" DECIMAL(10,2) NOT NULL,
    "amountMxn" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerInvite" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "invitedEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaiverVersion" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "titleEs" TEXT NOT NULL,
    "bodyEsMx" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaiverVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TournamentPolicy_tournamentId_key" ON "TournamentPolicy"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "EventPolicyOverride_eventId_key" ON "EventPolicyOverride"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_manageToken_key" ON "Registration"("manageToken");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerInvite_entryId_key" ON "PartnerInvite"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerInvite_token_key" ON "PartnerInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_entryId_playerId_key" ON "TeamMember"("entryId", "playerId");

-- AddForeignKey
ALTER TABLE "TournamentPolicy" ADD CONSTRAINT "TournamentPolicy_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPolicyOverride" ADD CONSTRAINT "EventPolicyOverride_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntry" ADD CONSTRAINT "EventEntry_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEntry" ADD CONSTRAINT "EventEntry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerInvite" ADD CONSTRAINT "PartnerInvite_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "EventEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "EventEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaiverVersion" ADD CONSTRAINT "WaiverVersion_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
