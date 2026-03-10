import { VoteOption } from "@/lib/types";

// Custom SVG icons in brand colors — replaces platform emojis
// Each icon uses navy strokes/fills with pink and mauve accents

function WorthItIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circle */}
      <circle cx="20" cy="20" r="17" stroke="#0f3e80" strokeWidth="2" fill="#f5eef8" />
      {/* Checkmark */}
      <path
        d="M12 20.5L17.5 26L28 15"
        stroke="#0f3e80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small sparkle top-right */}
      <circle cx="32" cy="8" r="1.5" fill="#fb6ec2" />
      <circle cx="35" cy="12" r="1" fill="#d1aade" />
    </svg>
  );
}

function AsyncIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Envelope body */}
      <rect
        x="5"
        y="11"
        width="30"
        height="20"
        rx="3"
        stroke="#0f3e80"
        strokeWidth="2"
        fill="#f5eef8"
      />
      {/* Envelope flap */}
      <path
        d="M5 14L20 24L35 14"
        stroke="#0f3e80"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow indicating "send away" */}
      <path
        d="M28 7L33 4L31 9"
        stroke="#fb6ec2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="25"
        y1="9"
        x2="33"
        y2="4"
        stroke="#d1aade"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function TooManyPeopleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Person 1 (front) */}
      <circle cx="14" cy="14" r="4" stroke="#0f3e80" strokeWidth="2" fill="#f5eef8" />
      <path
        d="M6 30C6 24.5 9.6 20 14 20C18.4 20 22 24.5 22 30"
        stroke="#0f3e80"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Person 2 (behind-right) */}
      <circle cx="26" cy="14" r="4" stroke="#0f3e80" strokeWidth="2" fill="#f5eef8" />
      <path
        d="M18 30C18 24.5 21.6 20 26 20C30.4 20 34 24.5 34 30"
        stroke="#0f3e80"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Person 3 (peeking from behind — just a head) */}
      <circle cx="20" cy="9" r="3" stroke="#d1aade" strokeWidth="1.5" fill="#f5eef8" />
      {/* Overflow indicator */}
      <circle cx="35" cy="8" r="1.2" fill="#fb6ec2" />
      <circle cx="35" cy="12" r="1.2" fill="#fb6ec2" />
      <circle cx="35" cy="16" r="1.2" fill="#fb6ec2" />
    </svg>
  );
}

function TooLongIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Clock face */}
      <circle cx="20" cy="20" r="16" stroke="#0f3e80" strokeWidth="2" fill="#f5eef8" />
      {/* Hour hand */}
      <line
        x1="20"
        y1="20"
        x2="20"
        y2="11"
        stroke="#0f3e80"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Minute hand — pointing right, implying lots of time passed */}
      <line
        x1="20"
        y1="20"
        x2="30"
        y2="17"
        stroke="#0f3e80"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx="20" cy="20" r="1.5" fill="#0f3e80" />
      {/* Alarm/warning zigzag lines */}
      <path
        d="M33 6L35 3M36 8L39 6M33 10L36 10"
        stroke="#fb6ec2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const VOTE_ICON_MAP: Record<VoteOption, React.FC<{ className?: string }>> = {
  worth_it: WorthItIcon,
  could_be_async: AsyncIcon,
  too_many_people: TooManyPeopleIcon,
  too_long: TooLongIcon,
};

export function VoteIcon({
  option,
  className = "size-10",
}: {
  option: VoteOption;
  className?: string;
}) {
  const Icon = VOTE_ICON_MAP[option];
  return <Icon className={className} />;
}
